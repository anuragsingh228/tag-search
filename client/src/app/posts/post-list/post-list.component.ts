import { Component, OnInit, OnDestroy } from '@angular/core';
import { PostsService } from '../posts.service';
import { Subscription } from 'rxjs';
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
import { Post } from '../post.model';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css'],
})
export class PostListComponent implements OnInit, OnDestroy {
  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  tagCtrl = new FormControl();
  filteredTags: Observable<string[]>;
  tags: string[] = [];
  alltags: string[] = [];
  post: Post;

  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  posts: Post[] = [];
  private postsSub: Subscription;
  constructor(public postsService: PostsService) {
    /*****************    Populating tags and alltags     **********************/
    this.postsService.getalltag().subscribe((res: any) => {
      this.alltags = res.alltags;
    });
    this.filteredTags = this.tagCtrl.valueChanges.pipe(
      startWith(null),
      map((tag: string | null) =>
        tag ? this._filter(tag) : this.alltags.slice()
      )
    );
  }

  ngOnInit() {
    var filter: string = ''; /*********** to get all posts  **********/
    this.postsService.getPosts(filter);
    this.postsSub = this.postsService
      .getPostUpdateListener()
      .subscribe((posts: Post[]) => {
        this.posts = posts;
      });
  }

  /*******************    Handling Chips i.e chips     ********************/

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

  /*************** Deleting a post, called by click event of delete button  *****************/
  onDelete(postId: string) {
    this.postsService.deletePost(postId);
  }

  /**************** Searching posts on tags   ***********************************/
  onFilter() {
    /**  making filter= "?a=tag1&a=tag2&" in this format   **********/

    var filter: string = '?';
    for (let index = 0; index < this.tags.length; index++) {
      let dup = 'a=' + this.tags[index] + '&';
      filter = filter.concat(dup);
    }

    this.postsService.getPosts(filter);

    this.postsSub = this.postsService
      .getPostUpdateListener()
      .subscribe((posts: Post[]) => {
        this.posts = posts;
      });
  }

  /**************  to avoid memory leak   *******/
  ngOnDestroy() {
    this.postsSub.unsubscribe();
  }
}
