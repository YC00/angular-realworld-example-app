import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { ArticleListConfig, TagsService, UserService, ArticlesService } from '../core';

@Component({
  selector: 'app-home-page',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  constructor(
    private articlesService: ArticlesService,
    private router: Router,
    private tagsService: TagsService,
    private userService: UserService
  ) {}

  isAuthenticated: boolean;
  listConfig: ArticleListConfig = {
    type: 'all',
    filters: {}
  };
  tags: Array<string> = [];
  tagsLoaded = false;
  latitude: number = 0;
  longitude: number = 0;
  range: number = 0;

  ngOnInit() {
    this.userService.isAuthenticated.subscribe(
      (authenticated) => {
        this.isAuthenticated = authenticated;

        // set the article list accordingly
        if (authenticated) {
          this.setListTo('feed');
        } else {
          this.setListTo('all');
        }
      }
    );

    this.tagsService.getAll()
    .subscribe(tags => {
      this.tags = tags;
      this.tagsLoaded = true;
    });
  }

  setListTo(type: string = '', filters: Object = {}) {
    // If feed is requested but user is not authenticated, redirect to login
    if (type === 'feed' && !this.isAuthenticated) {
      this.router.navigateByUrl('/login');
      return;
    }

    // Otherwise, set the list object
    this.range = 0;
    this.listConfig = {type: type, filters: filters};
  }

  getLatitudeLongitude(){
    this.articlesService.getGeoLoc()
        .subscribe(response => {
          if(this.latitude==null&&this.longitude==null){
            this.latitude = response.ip.latitude;
            this.longitude = response.ip.longitude;
          }

          this.articlesService.searchArticlesWithinRange(this.range, this.latitude, this.longitude).subscribe(
            articleData => {
              console.log(articleData);
            }
          );
        }, error => {
          console.error(error);
        });
  }

  searchWithinRange(rangeNumber: number){
    this.range = rangeNumber;
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.getLatitudeLongitude();
      }, (error) =>{ 
        if (error.code == error.PERMISSION_DENIED){
          this.getLatitudeLongitude();
        }
      });
    }else{
      this.getLatitudeLongitude();
    }
  }
}
