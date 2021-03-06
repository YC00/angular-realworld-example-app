import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Article, ArticlesService } from '../core';

@Component({
  selector: 'app-editor-page',
  templateUrl: './editor.component.html'
})
export class EditorComponent implements OnInit {
  article: Article = {} as Article;
  articleForm: FormGroup;
  tagField = new FormControl();
  errors: Object = {};
  isSubmitting = false;

  constructor(
    private articlesService: ArticlesService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    // use the FormBuilder to create a form group
    this.articleForm = this.fb.group({
      title: '',
      description: '',
      body: ''
    });

    // Initialized tagList as empty array
    this.article.tagList = [];

    // Optional: subscribe to value changes on the form
    // this.articleForm.valueChanges.subscribe(value => this.updateArticle(value));
  }

  ngOnInit() {
    // If there's an article prefetched, load it
    this.route.data.subscribe((data: { article: Article }) => {
      if (data.article) {
        this.article = data.article;
        this.articleForm.patchValue(data.article);
      }
    });
  }

  addTag() {
    // retrieve tag control
    const tag = this.tagField.value;
    // only add tag if it does not exist yet
    if (this.article.tagList.indexOf(tag) < 0) {
      this.article.tagList.push(tag);
    }
    // clear the input
    this.tagField.reset('');
  }

  removeTag(tagName: string) {
    this.article.tagList = this.article.tagList.filter(tag => tag !== tagName);
  }

  saveArticles(){
    this.articlesService.getGeoLoc()
        .subscribe(response => {
          if(this.article.latitude==null&&this.article.longitude==null){
            this.article.latitude = response.ip.latitude;
            this.article.longitude = response.ip.longitude;
          }
          this.article.country = response.ip.country;
          this.article.city = response.ip.city;
          this.articlesService.save(this.article).subscribe(
            article => this.router.navigateByUrl('/article/' + article.slug),
            err => {
              this.errors = err;
              this.isSubmitting = false;
            }
          );
        }, error => {
          console.error(error);
        });
  }

  submitForm() {
    this.isSubmitting = true;

    // update the model
    this.updateArticle(this.articleForm.value);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.article.latitude = position.coords.latitude;
        this.article.longitude = position.coords.longitude;
        this.saveArticles();
      }, (error) =>{ 
        if (error.code == error.PERMISSION_DENIED){
          this.saveArticles();
        }
      });
    }else{
      this.saveArticles();
    }
    // if (navigator.geolocation) {
    //   navigator.geolocation.getCurrentPosition(function(position){
    //     this.article.latitude = position.coords.latitude;
    //     this.article.longitude = position.coords.longitude;
    //   });
    // }else{
    //   this.articlesService.getgeoloc()
    //     .subscribe(response => {
    //       console.log(response);
    //     }, error => {
    //       console.error(error);
    //     });
    // }

    // post the changes
  }

  updateArticle(values: Object) {
    Object.assign(this.article, values);
  }
}
