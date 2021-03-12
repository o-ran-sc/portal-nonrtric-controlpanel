import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PolicyInstance, PolicyInstances, PolicyType, PolicyTypes, PolicyTypeSchema } from 'src/app/interfaces/policy.types';
import { PolicyService } from 'src/app/services/policy/policy.service';
import { PolicyControlComponent } from '../policy-control.component';
import { PolicyInstanceDataSource } from '../policy-instance/policy-instance.datasource';
import { PolicyTypeDataSource } from './policy-type.datasource';

class PolicyTypeInfo {
  constructor(public type: PolicyTypeSchema) { }

  isExpanded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
}

@Component({
  selector: 'nrcp-policy-type',
  templateUrl: './policy-type.component.html',
  styleUrls: ['./policy-type.component.scss']
})
export class PolicyTypeComponent implements OnInit {

  @Input() policyTypeId: string;

  isVisible: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  policyTypeInfo: PolicyTypeInfo;

  constructor(private policyTypeDataSource: PolicyTypeDataSource) {
  }

  ngOnInit(): void {
    const policyTypeSchema = this.policyTypeDataSource.getPolicyType(this.policyTypeId);
    this.policyTypeInfo = new PolicyTypeInfo(policyTypeSchema);
    this.isVisible.next(false);
  }

  public setIsVisible(status: boolean){
    this.isVisible.next(status);
  }

  public toggleVisible() {
    this.isVisible.next(!this.isVisible.value);
  }

  /*isInstancesShown(policyTypeId: string): boolean {
    return this.policyService.getPolicy(policyTypeId).isEx;
  }*/
}