import { Component, inject, signal } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { finalize } from 'rxjs'
import { ProjectsService } from './projects.service'

// #region form
@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="save()">
      <label>Key <input formControlName="key" /></label>
      @if (form.controls.key.touched && form.controls.key.invalid) { <small>Lowercase letters, digits and dashes, up to 40.</small> }
      <label>Name <input formControlName="displayName" /></label>
      @if (form.controls.displayName.touched && form.controls.displayName.invalid) { <small>Required, up to 100.</small> }
      <label>Adapter URL <input formControlName="adapterBaseUrl" /></label>
      @if (form.controls.adapterBaseUrl.touched && form.controls.adapterBaseUrl.invalid) { <small>An http(s) URL.</small> }
      @if (serverError()) { <p role="alert">{{ serverError() }}</p> }
      <button [disabled]="form.invalid || saving()">Save</button>
    </form>
  `,
})
export class ProjectFormComponent {
  private api = inject(ProjectsService)
  saving = signal(false)
  serverError = signal<string | null>(null)

  // The rules live on the controls; the form is invalid while any control is.
  form = inject(FormBuilder).nonNullable.group({
    key: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]{1,40}$/)]],
    displayName: ['', [Validators.required, Validators.maxLength(100)]],
    adapterBaseUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/\S+$/)]],
  })

  save() {
    if (this.form.invalid) return this.form.markAllAsTouched()
    this.saving.set(true)
    this.api
      .create(this.form.getRawValue())
      .pipe(finalize(() => this.saving.set(false))) // runs on success and on error
      .subscribe({
        next: () => this.form.reset(),
        // The server checks again; show its message (e.g. 409 already exists).
        error: (e) => this.serverError.set(e.error?.error ?? 'Could not save.'),
      })
  }
}
// #endregion
