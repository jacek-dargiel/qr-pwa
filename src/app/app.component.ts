import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import jsqr from 'jsqr';

import { interval, animationFrameScheduler, Subscription, Observable } from 'rxjs';
import { map, mapTo, tap, filter, throttleTime } from 'rxjs/operators';

@Component({
  selector: 'qr-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ]
})
export class AppComponent implements AfterViewInit {
  videoStreamHidden = true;

  constrains: MediaStreamConstraints = { video: { facingMode: { ideal: 'environment'} } };
  mediaStream: MediaStream;

  @ViewChild('video') video: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement>;

  scannedCode: string;
  scanSub: Subscription;
  scans$: Observable<string> = interval(0, animationFrameScheduler).pipe(
    tap(() => {
      this.canvas.nativeElement.width = this.video.nativeElement.clientWidth;
      this.canvas.nativeElement.height = this.video.nativeElement.clientHeight;
      const context = this.canvas.nativeElement.getContext('2d');
      context.drawImage(
        this.video.nativeElement,
        0,
        0,
        this.video.nativeElement.clientWidth,
        this.video.nativeElement.clientHeight,
      );
    }),
    filter(() => this.canvas.nativeElement.clientWidth > 0),
    map(() => {
      const context = this.canvas.nativeElement.getContext('2d');
      return context.getImageData(
        0, 0,
        this.canvas.nativeElement.clientWidth,
        this.canvas.nativeElement.clientHeight,
      );
    }),
    map((data: ImageData) => {
      return jsqr(data.data, data.width, data.height);
    }),
    filter(Boolean),
    throttleTime(5000),
    map(result => result.data),
    tap(data => console.log({data}))
  );

  constructor() {}

  ngAfterViewInit() {
    this.updateMediaStream();
    this.resubscribe();
  }

  updateMediaStream() {
    navigator.mediaDevices.getUserMedia(this.constrains)
      .then(stream => {
        this.mediaStream = stream;
      })
      .catch(error => console.error(error));
  }

  changeDevice(deviceInfo: MediaDeviceInfo) {
    this.constrains = { video: { deviceId: deviceInfo.deviceId } };
    this.updateMediaStream();
    this.resubscribe();
  }

  resubscribe() {
    if (this.scanSub) {
      this.scanSub.unsubscribe();
    }
    this.scanSub = this.scans$.subscribe(data => this.handleCode(data));
  }

  handleCode(code: string) {
    this.scannedCode = code;
  }
}
