import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  ngOnInit(): void {
    chrome.tabs.executeScript({
      code: 'console.log("addd")'
  });
  }
  title = 'leetcode-extension';
}
