import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { GridRowBuilder } from './GridRowBuilder';
import { GalleryLightboxComponent } from '../lightbox/lightbox.gallery.component';
import { GridMedia } from './GridMedia';
import { GalleryPhotoComponent } from './photo/photo.grid.gallery.component';
import { OverlayService } from '../overlay.service';
import { Config } from '../../../../../common/config/public/Config';
import { PageHelper } from '../../../model/page.helper';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { QueryService } from '../../../model/query.service';
import { ContentService } from '../content.service';
import {
  MediaDTO,
  MediaDTOUtils,
} from '../../../../../common/entities/MediaDTO';
import { QueryParams } from '../../../../../common/QueryParams';

@Component({
  selector: 'app-gallery-grid',
  templateUrl: './grid.gallery.component.html',
  styleUrls: ['./grid.gallery.component.css'],
})
export class GalleryGridComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy
{
  @ViewChild('gridContainer', { static: false }) gridContainer: ElementRef;
  @ViewChildren(GalleryPhotoComponent)
  gridPhotoQL: QueryList<GalleryPhotoComponent>;
  @Input() lightbox: GalleryLightboxComponent;
  @Input() media: MediaDTO[];
  photosToRender: GridMedia[] = [];
  containerWidth = 0;
  screenHeight = 0;
  public IMAGE_MARGIN = 2;
  isAfterViewInit = false;
  subscriptions: {
    route: Subscription;
  } = {
    route: null,
  };
  delayedRenderUpToPhoto: string = null;
  private scrollListenerPhotos: GalleryPhotoComponent[] = [];
  private TARGET_COL_COUNT = 5;
  private MIN_ROW_COUNT = 2;
  private MAX_ROW_COUNT = 5;
  private onScrollFired = false;
  private helperTime: number = null;
  private renderedPhotoIndex = 0;

  constructor(
    private overlayService: OverlayService,
    private changeDetector: ChangeDetectorRef,
    public queryService: QueryService,
    private router: Router,
    public galleryService: ContentService,
    private route: ActivatedRoute
  ) {}

  ngOnChanges(): void {
    this.onChange();
  }

  ngOnInit(): void {
    this.subscriptions.route = this.route.queryParams.subscribe(
      (params: Params): void => {
        if (
          params[QueryParams.gallery.photo] &&
          params[QueryParams.gallery.photo] !== ''
        ) {
          this.delayedRenderUpToPhoto = params[QueryParams.gallery.photo];
          if (!this.media || this.media.length === 0) {
            return;
          }

          this.renderUpToMedia(params[QueryParams.gallery.photo]);
        }
      }
    );
  }

  onChange = () => {
    if (this.isAfterViewInit === false) {
      return;
    }
    this.updateContainerDimensions();
    this.mergeNewPhotos();
    this.helperTime = window.setTimeout((): void => {
      this.renderPhotos();
      if (this.delayedRenderUpToPhoto) {
        this.renderUpToMedia(this.delayedRenderUpToPhoto);
      }
    }, 0);
  };

  ngOnDestroy(): void {
    if (this.helperTime != null) {
      clearTimeout(this.helperTime);
    }
    if (this.subscriptions.route !== null) {
      this.subscriptions.route.unsubscribe();
      this.subscriptions.route = null;
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.isAfterViewInit === false) {
      return;
    }
    // render the same amount of images on resize
    const renderedIndex = this.renderedPhotoIndex;
    // do not rerender if container is not changes
    if (this.updateContainerDimensions() === false) {
      return;
    }
    this.renderPhotos(renderedIndex);
  }

  photoClicked(media: MediaDTO): void {
    this.router.navigate([], {
      queryParams: this.queryService.getParams(media),
    });
  }

  ngAfterViewInit(): void {
    this.lightbox.setGridPhotoQL(this.gridPhotoQL);

    if (Config.Client.Other.enableOnScrollThumbnailPrioritising === true) {
      this.gridPhotoQL.changes.subscribe((): void => {
        this.scrollListenerPhotos = this.gridPhotoQL.filter(
          (pc): boolean => pc.ScrollListener
        );
      });
    }

    this.updateContainerDimensions();
    this.clearRenderedPhotos();
    this.helperTime = window.setTimeout((): void => {
      this.renderPhotos();
    }, 0);
    this.isAfterViewInit = true;
  }

  public renderARow(): number {
    if (
      this.renderedPhotoIndex >= this.media.length ||
      this.containerWidth === 0
    ) {
      return null;
    }

    let maxRowHeight = this.getMaxRowHeight();
    const minRowHeight = this.screenHeight / this.MAX_ROW_COUNT;

    const photoRowBuilder = new GridRowBuilder(
      this.media,
      this.renderedPhotoIndex,
      this.IMAGE_MARGIN,
      this.containerWidth - this.overlayService.getPhantomScrollbarWidth()
    );

    photoRowBuilder.addPhotos(this.TARGET_COL_COUNT);
    photoRowBuilder.adjustRowHeightBetween(minRowHeight, maxRowHeight);

    // little trick: We don't want too big single images. But if a little extra height helps fit the row, its ok
    if (photoRowBuilder.getPhotoRow().length > 1) {
      maxRowHeight *= 1.2;
    }
    const rowHeight = Math.min(photoRowBuilder.calcRowHeight(), maxRowHeight);
    const imageHeight = rowHeight - this.IMAGE_MARGIN * 2;

    photoRowBuilder.getPhotoRow().forEach((photo): void => {
      const imageWidth = imageHeight * MediaDTOUtils.calcAspectRatio(photo);
      this.photosToRender.push(
        new GridMedia(photo, imageWidth, imageHeight, this.renderedPhotoIndex)
      );
    });

    this.renderedPhotoIndex += photoRowBuilder.getPhotoRow().length;
    return rowHeight;
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (
      !this.onScrollFired &&
      this.media &&
      // should we trigger this at all?
      (this.renderedPhotoIndex < this.media.length ||
        this.scrollListenerPhotos.length > 0)
    ) {
      window.requestAnimationFrame((): void => {
        this.renderPhotos();

        if (Config.Client.Other.enableOnScrollThumbnailPrioritising === true) {
          this.scrollListenerPhotos.forEach(
            (pc: GalleryPhotoComponent): void => {
              pc.onScroll();
            }
          );
          this.scrollListenerPhotos = this.scrollListenerPhotos.filter(
            (pc): boolean => pc.ScrollListener
          );
        }

        this.onScrollFired = false;
      });
      this.onScrollFired = true;
    }
  }

  private getMaxRowHeight(): number {
    return this.screenHeight / this.MIN_ROW_COUNT;
  }

  /**
   * Makes sure that the photo with the given mediaString is visible on the screen
   */
  private renderUpToMedia(mediaStringId: string): void {
    const index = this.media.findIndex(
      (p): boolean => this.queryService.getMediaStringId(p) === mediaStringId
    );
    if (index === -1) {
      this.router.navigate([], { queryParams: this.queryService.getParams() });
      return;
    }
    // Make sure that at leas one more photo is rendered
    // It is possible that only the last few pixels of a photo is visible,
    // so not required to render more, but the scrollbar does not trigger more photos to render
    // (on ligthbox navigation)
    while (
      this.renderedPhotoIndex - 1 < index + 1 &&
      this.renderARow() !== null
      // eslint-disable-next-line no-empty
    ) {}
  }

  private clearRenderedPhotos(): void {
    this.photosToRender = [];
    this.renderedPhotoIndex = 0;
    this.changeDetector.detectChanges();
  }

  // TODO: This is deprecated,
  // we do not post update galleries anymore since the preview member in the DriectoryDTO
  private mergeNewPhotos(): void {
    // merge new data with old one
    let lastSameIndex = 0;
    let lastRowId = null;
    let i = 0;
    for (; i < this.media.length && i < this.photosToRender.length; ++i) {
      // If a media changed the whole row has to be removed
      if (this.photosToRender[i].rowId !== lastRowId) {
        lastSameIndex = i;
        lastRowId = this.photosToRender[i].rowId;
      }
      if (this.photosToRender[i].equals(this.media[i]) === false) {
        break;
      }
    }
    // if all the same
    if (
      this.photosToRender.length > 0 &&
      i === this.photosToRender.length &&
      i === this.media.length &&
      this.photosToRender[i - 1].equals(this.media[i - 1])
    ) {
      lastSameIndex = i;
    }
    if (lastSameIndex > 0) {
      this.photosToRender.splice(
        lastSameIndex,
        this.photosToRender.length - lastSameIndex
      );
      this.renderedPhotoIndex = lastSameIndex;
    } else {
      this.clearRenderedPhotos();
    }
  }

  /**
   * Returns true, if scroll is >= 70% to render more images.
   * Or of onscroll rendering is off: return always to render all the images at once
   * @param offset Add height to the client height (content is not yet added to the dom, but calculate with it)
   * @returns boolean
   */
  private shouldRenderMore(offset = 0): boolean {
    const bottomOffset = this.getMaxRowHeight() * 2;
    return (
      Config.Client.Other.enableOnScrollRendering === false ||
      PageHelper.ScrollY >=
        document.body.clientHeight +
          offset -
          window.innerHeight -
          bottomOffset ||
      (document.body.clientHeight + offset) * 0.85 < window.innerHeight
    );
  }

  private renderPhotos(numberOfPhotos = 0): void {
    if (!this.media) {
      return;
    }
    if (
      this.containerWidth === 0 ||
      this.renderedPhotoIndex >= this.media.length ||
      !this.shouldRenderMore()
    ) {
      return;
    }

    let renderedContentHeight = 0;

    while (
      this.renderedPhotoIndex < this.media.length &&
      (this.shouldRenderMore(renderedContentHeight) === true ||
        this.renderedPhotoIndex < numberOfPhotos)
    ) {
      const ret = this.renderARow();
      if (ret === null) {
        throw new Error('Grid media rendering failed');
      }
      renderedContentHeight += ret;
    }
  }

  private updateContainerDimensions(): boolean {
    if (!this.gridContainer) {
      return false;
    }

    const pre = PageHelper.isScrollYVisible();
    PageHelper.showScrollY();
    // if the width changed a bit or the height changed a lot
    if (
      this.containerWidth !== this.gridContainer.nativeElement.clientWidth ||
      this.screenHeight < window.innerHeight * 0.75 ||
      this.screenHeight > window.innerHeight * 1.25
    ) {
      this.screenHeight = window.innerHeight;
      this.containerWidth = this.gridContainer.nativeElement.clientWidth;
      this.clearRenderedPhotos();
      if (!pre) {
        PageHelper.hideScrollY();
      }
      return true;
    }

    if (!pre) {
      PageHelper.hideScrollY();
    }
    return false;
  }
}
