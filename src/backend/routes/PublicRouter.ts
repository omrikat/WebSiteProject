import { Express, NextFunction, Request, Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import * as ejs from 'ejs';
import { Config } from '../../common/config/private/Config';
import { ProjectPath } from '../ProjectPath';
import { AuthenticationMWs } from '../middlewares/user/AuthenticationMWs';
import { CookieNames } from '../../common/CookieNames';
import { ErrorCodes, ErrorDTO } from '../../common/entities/Error';
import { UserDTO } from '../../common/entities/UserDTO';
import { ServerTimeEntry } from '../middlewares/ServerTimingMWs';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      locale?: string;
      localePath?: string;
      tpl?: Record<string, any>;
      timing?: { [key: string]: ServerTimeEntry };
    }

    interface Response {
      tpl?: Record<string, any>;
    }
  }
}

export class PublicRouter {
  public static route(app: Express): void {
    const setLocale = (req: Request, res: Response, next: NextFunction) => {
      let selectedLocale = req.locale;
      if (req.cookies && req.cookies[CookieNames.lang]) {
        if (
          Config.Client.languages.indexOf(req.cookies[CookieNames.lang]) !== -1
        ) {
          selectedLocale = req.cookies[CookieNames.lang];
        }
      }
      res.cookie(CookieNames.lang, selectedLocale);
      req.localePath = selectedLocale;
      next();
    };

    const renderIndex = (req: Request, res: Response, next: NextFunction) => {
      ejs.renderFile(
        path.join(ProjectPath.FrontendFolder, req.localePath, 'index.html'),
        res.tpl,
        (err, str) => {
          if (err) {
            return next(new ErrorDTO(ErrorCodes.GENERAL_ERROR, err.message));
          }
          res.send(str);
        }
      );
    };

    const redirectToBase = (locale: string) => {
      return (req: Request, res: Response) => {
        if (Config.Client.languages.indexOf(locale) !== -1) {
          res.cookie(CookieNames.lang, locale);
        }
        res.redirect('/?ln=' + locale);
      };
    };

    app.use((req: Request, res: Response, next: NextFunction) => {
      res.tpl = {};

      res.tpl.user = null;
      if (req.session['user']) {
        res.tpl.user = {
          id: req.session['user'].id,
          name: req.session['user'].name,
          csrfToken: req.session['user'].csrfToken,
          role: req.session['user'].role,
          usedSharingKey: req.session['user'].usedSharingKey,
          permissions: req.session['user'].permissions,
        } as UserDTO;

        if (!res.tpl.user.csrfToken && req.csrfToken) {
          res.tpl.user.csrfToken = req.csrfToken();
        }
      }
      const confCopy = {
        Client: Config.Client.toJSON({ attachVolatile: true }),
      };
      // Escaping html tags, like <script></script>
      confCopy.Client.Other.customHTMLHead =
        confCopy.Client.Other.customHTMLHead
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      res.tpl.Config = confCopy;
      res.tpl.customHTMLHead = Config.Client.Other.customHTMLHead;

      return next();
    });

    app.get('/heartbeat', (req: Request, res: Response) => {
      res.sendStatus(200);
    });

    app.get('/manifest.json', (req: Request, res: Response) => {
      res.send({
        name: Config.Client.applicationTitle,
        icons: [
          {
            src: 'assets/icon_inv.png',
            sizes: '48x48 72x72 96x96 128x128 256x256',
          },
        ],
        display: 'standalone',
        orientation: 'any',
        start_url:
          Config.Client.publicUrl === '' ? '.' : Config.Client.publicUrl,
        background_color: '#000000',
        theme_color: '#000000',
      });
    });

    app.get(
      [
        '/',
        '/login',
        '/gallery*',
        '/share*',
        '/admin',
        '/duplicates',
        '/faces',
        '/albums',
        '/search*',
      ],
      AuthenticationMWs.tryAuthenticate,
      setLocale,
      renderIndex
    );
    Config.Client.languages.forEach((l) => {
      app.get(
        [
          '/' + l + '/',
          '/' + l + '/login',
          '/' + l + '/gallery*',
          '/' + l + '/share*',
          '/' + l + '/admin',
          '/' + l + '/search*',
        ],
        redirectToBase(l)
      );
    });

    const renderFile = (subDir = '') => {
      return (req: Request, res: Response) => {
        const file = path.join(
          ProjectPath.FrontendFolder,
          req.localePath,
          subDir,
          req.params.file
        );
        if (!fs.existsSync(file)) {
          return res.sendStatus(404);
        }
        res.sendFile(file);
      };
    };

    app.get(
      '/assets/:file(*)',
      setLocale,
      AuthenticationMWs.normalizePathParam('file'),
      renderFile('assets')
    );
    app.get(
      '/:file',
      setLocale,
      AuthenticationMWs.normalizePathParam('file'),
      renderFile()
    );
  }
}
