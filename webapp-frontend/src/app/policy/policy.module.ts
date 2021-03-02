import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { PolicyCardComponent } from './policy-card/policy-card.component';
import { PolicyControlComponent } from './policy-control.component';
import { NoTypePolicyInstanceDialogComponent } from './no-type-policy-instance-dialog/no-type-policy-instance-dialog.component';
import { PolicyInstanceDialogComponent } from './policy-instance-dialog/policy-instance-dialog.component';
import { PolicyInstanceComponent } from './policy-instance/policy-instance.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MaterialDesignFrameworkModule } from 'angular6-json-schema-form';
import { FlexLayoutModule } from '@angular/flex-layout';
import { Routes, RouterModule } from '@angular/router';
import { RicSelectorComponent } from './ric-selector/ric-selector.component';
import { NoTypePolicyEditorComponent } from './no-type-policy-editor/no-type-policy-editor.component';

const routes:Routes = [
  {path: 'policy', component: PolicyControlComponent}
];

@NgModule({
  declarations: [
    NoTypePolicyInstanceDialogComponent,
    PolicyCardComponent,
    PolicyControlComponent,
    PolicyInstanceComponent,
    PolicyInstanceDialogComponent,
    RicSelectorComponent,
    NoTypePolicyEditorComponent,
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatPaginatorModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MaterialDesignFrameworkModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    PolicyCardComponent,
    PolicyControlComponent
  ]
})
export class PolicyModule { }
