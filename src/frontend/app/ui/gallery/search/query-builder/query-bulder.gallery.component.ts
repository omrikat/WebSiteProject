import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
} from '@angular/core';
import {
  SearchQueryDTO,
  SearchQueryTypes,
  TextSearch,
} from '../../../../../../common/entities/SearchQueryDTO';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { SearchQueryParserService } from '../search-query-parser.service';

@Component({
  selector: 'app-gallery-search-query-builder',
  templateUrl: './query-builder.gallery.component.html',
  styleUrls: ['./query-builder.gallery.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GallerySearchQueryBuilderComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => GallerySearchQueryBuilderComponent),
      multi: true,
    },
  ],
})
export class GallerySearchQueryBuilderComponent
  implements ControlValueAccessor, Validator
{
  public searchQueryDTO: SearchQueryDTO = {
    type: SearchQueryTypes.any_text,
    text: '',
  } as TextSearch;
  @Output() search = new EventEmitter<void>();
  @Input() placeholder = "Search";
  public rawSearchText = '';

  constructor(private searchQueryParserService: SearchQueryParserService) {}

  validateRawSearchText(): void {
    try {
      this.searchQueryDTO = this.searchQueryParserService.parse(
        this.rawSearchText
      );
      this.onChange();
    } catch (e) {
      console.error(e);
    }
  }

  resetQuery(): void {
    this.searchQueryDTO = {
      text: '',
      type: SearchQueryTypes.any_text,
    } as TextSearch;
  }

  onQueryChange(): void {
    this.rawSearchText = this.searchQueryParserService.stringify(
      this.searchQueryDTO
    );
    this.onChange();
  }

  validate(control: FormControl): ValidationErrors {
    return { required: true };
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public onTouched(): void {}

  public writeValue(obj: any): void {
    this.searchQueryDTO = obj;
    this.rawSearchText = this.searchQueryParserService.stringify(
      this.searchQueryDTO
    );
  }

  registerOnChange(fn: (_: any) => void): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.propagateTouch = fn;
  }

  public onChange(): void {
    this.propagateChange(this.searchQueryDTO);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private propagateChange = (_: unknown): void => {};

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private propagateTouch = (_: unknown): void => {};
}
