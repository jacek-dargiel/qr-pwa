import { Component, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'qr-media-select',
  templateUrl: './media-select.component.html',
})
export class MediaSelectComponent implements OnInit {
  mediaDevices: MediaDeviceInfo[];

  @Output() select = new EventEmitter<MediaDeviceInfo>();
  selectedDevice: MediaDeviceInfo;

  constructor() { }

  ngOnInit() {
    navigator.mediaDevices.enumerateDevices()
      .then((devices: MediaDeviceInfo[]) => {
        this.mediaDevices = devices.filter(device => device.kind === 'videoinput');
        this.selectedDevice = this.mediaDevices[0];
      })
      .catch(error => console.error(error));
  }

  emitChange(device: MediaDeviceInfo) {
    this.selectedDevice = device;
    this.select.emit(device);
  }
}
