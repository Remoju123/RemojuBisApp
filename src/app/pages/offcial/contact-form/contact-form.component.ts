import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss']
})
export class ContactFormComponent implements OnInit {
  onSubmit(arg0: any) {
    throw new Error('Method not implemented.');
  }

  FormData: FormGroup;

  constructor(
    private builder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.FormData = this.builder.group({
      Fullname: new FormControl('', [Validators.required]),
      Email: new FormControl('', [Validators.compose([Validators.required, Validators.email])]),
      confirmEmail:new FormControl('',[Validators.required]),
      title:new FormControl('',[Validators.required]),
      Comment: new FormControl('', [Validators.required])
    })
  }



}
