import { Post } from './post.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient) {}

  getPosts() {
    this.http
      .get<{ message: string; posts: any }>('http://localhost:3000/')
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
        console.log(transformedPosts);
        this.posts = transformedPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string, tags: string[]) {
    const post: Post = {
      id: 'abcd',
      title: title,
      content: content,
      tags: tags,
    };

    this.http
      .post<{ msg: string }>('http://localhost:3000/addarticle', post)
      .subscribe((responseData) => {
        console.log(responseData.msg);
        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);
      });
  }
}
