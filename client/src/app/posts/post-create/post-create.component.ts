import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { PostsService } from '../posts.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  MatAutocompleteSelectedEvent,
  MatAutocomplete,
} from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Post } from '../post.model';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css'],
})
export class PostCreateComponent implements OnInit {
  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  tagCtrl = new FormControl();
  filteredTags: Observable<string[]>;
  tags: string[] = [];
  alltags: string[] = [];
  private mode = 'create';
  private postId: string;
  post: Post;

  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  constructor(
    public postsService: PostsService,
    public route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.postsService.getalltag().subscribe((res: any) => {
      /********** Populating "tags"(contains tags of particular article) and alltags(contains all tags used) */

      this.alltags = res.alltags;
      this.filteredTags = this.tagCtrl.valueChanges.pipe(
        startWith(null),
        map((tag: string | null) =>
          tag ? this._filter(tag) : this.alltags.slice()
        )
      );
    });

    /************** routing defined to deferentiate between post create and post update     *********************/

    this.route.paramMap.subscribe((paraMap: ParamMap) => {
      if (paraMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paraMap.get('postId');
        this.postsService.getPost(this.postId).subscribe((postData) => {
          this.post = {
            id: postData._id,
            title: postData.title,
            content: postData.content,
            tags: postData.tags,
          };
          this.tags = this.post.tags;
        });
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  /**************************************  Chip handling i.e tags array  ******************/

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our tags
    if ((value || '').trim()) {
      this.tags.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.tagCtrl.setValue(null);
  }

  remove(tag: string): void {
    const index = this.tags.indexOf(tag);

    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.tags.push(event.option.viewValue);
    this.tagInput.nativeElement.value = '';
    this.tagCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.alltags.filter(
      (tag) => tag.toLowerCase().indexOf(filterValue) === 0
    );
  }

  /*************************************** Action on Save button click **********************/
  /*********************Checking the mode, prepulating in case of update ********************/

  onSavePost(form: NgForm) {
    if (form.invalid) {
      return;
    }
    if (this.mode === 'create') {
      this.postsService.addPost(
        form.value.title,
        form.value.content,
        this.tags
      );
    } else {
      this.postsService.updatePost(
        this.postId,
        form.value.title,
        form.value.content,
        this.tags
      );
    }
    /*******************************  Reset the forms after creation of post  **************/
    form.resetForm();
    this.tags = [];
  }
}
