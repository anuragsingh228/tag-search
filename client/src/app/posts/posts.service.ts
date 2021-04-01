import { Post } from './post.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class PostsService {
  private posts: Post[] = []; /*********    Contains all the posts      *********** */
  private postsUpdated = new Subject<
    Post[]
  >(); /***    Will contain the updated posts upon addition and updation of posts  ********/

  constructor(private http: HttpClient, private router: Router) {}

  /*****************                       for getting all the posts filter = ""                     *******************/
  /*****************  filter= "?a=tag1&a=tag2&" will get posts containing tag1 and tag2 both in their tags array  ******/

  getPosts(filter: string) {
    this.http
      .get<{ message: string; posts: any }>('http://localhost:3000/' + filter)
      .pipe(
        map((postData) => {
          return postData.posts.map((post) => {
            return {
              title: post.title,
              content: post.content,
              id: post._id,
              tags: post.tags,
            };
          });
        })
      )
      .subscribe((transformedPosts) => {
        this.posts = transformedPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }
  /***************** This service will help get the updated post in the postlist              *****************/
  /**************        This will return a Observable, you wil need to Subscribe while calling   ************/

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  /********************   Retrieve a particular post with id   ***************/
  getPost(id: string) {
    return this.http.get<{
      _id: string;
      title: string;
      content: string;
      tags: string[];
    }>('http://localhost:3000/' + id);
  }

  /*************************     Adding a new post and navigate to post-list page      ************************/

  addPost(title: string, content: string, tags: string[]) {
    const post: Post = {
      id: null,
      title: title,
      content: content,
      tags: tags,
    };

    this.http
      .post<{ msg: string; articleId: string }>(
        'http://localhost:3000/addarticle',
        post
      )
      .subscribe((responseData) => {
        const id = responseData.articleId;
        post.id = id;
        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);
        this.router.navigate(['/']);
      });
  }

  /*************************     Updating a post and navigate to post-list page      ************************/

  updatePost(id: string, title: string, content: string, tags: string[]) {
    const post: Post = { id: id, title: title, content: content, tags: tags };
    this.http.put('http://localhost:3000/' + id, post).subscribe((response) => {
      const updatedPosts = [...this.posts];
      const oldPostIndex = updatedPosts.findIndex((p) => p.id === post.id);
      updatedPosts[oldPostIndex] = post;
      this.posts = updatedPosts;
      this.postsUpdated.next([...this.posts]);
      this.router.navigate(['/']);
    });
  }

  /*******************    Delete a post and update the postsUpdated     ******************/

  deletePost(postId: string) {
    this.http.delete('http://localhost:3000/delete/' + postId).subscribe(() => {
      const updatedPosts = this.posts.filter((post) => post.id !== postId);
      this.posts = updatedPosts;
      this.postsUpdated.next([...this.posts]);
    });
  }

  /******************* Get all tags to prepopulate alltags array to give autocomplete feature   *************/
  getalltag() {
    return this.http.get('http://localhost:3000/all/tags');
  }
}
