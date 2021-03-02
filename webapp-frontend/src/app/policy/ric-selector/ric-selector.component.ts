import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, ControlContainer, FormBuilder, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { Ric, Rics } from 'src/app/interfaces/ric';
import { PolicyService } from 'src/app/services/policy/policy.service';

@Component({
  selector: 'nrcp-ric-selector',
  templateUrl: './ric-selector.component.html',
  styleUrls: ['./ric-selector.component.scss'],
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }]

})
export class RicSelectorComponent implements OnInit {

  @Input() instanceForm: FormGroup;
  @Input() policyTypeName: string = '';
  ric: string;
  allRics: string[] = [];

  constructor(
    private dataService: PolicyService,
    private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.instanceForm.addControl(
      'ricSelector', new FormControl(this.ric, [
        Validators.required
      ]));

    console.log('Ric:', this.ric);
    this.fetchRics();
  }

  get selectedRic(): string { return this.ric; }

  get ricSelector(): AbstractControl {
    return this.instanceForm.get('ricSelector');
  }

  private fetchRics() {
    console.log('fetchRics ', this.policyTypeName);
    const self: RicSelectorComponent = this;
    this.dataService.getRics(this.policyTypeName).subscribe(
      {
        next(value: Rics) {
          value.rics.forEach(ric => {
            self.allRics.push(ric.ric_id)
          });
          console.log(value);
        }
      });
  }
}
