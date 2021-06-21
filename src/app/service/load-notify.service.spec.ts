import { TestBed } from '@angular/core/testing';

import { LoadNotifyService } from './load-notify.service';

describe('LoadNotifyService', () => {
  let service: LoadNotifyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadNotifyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
