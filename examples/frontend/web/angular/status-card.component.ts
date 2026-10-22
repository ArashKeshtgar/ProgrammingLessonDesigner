import { Component, computed, inject, input, OnInit, output, signal } from '@angular/core'
import { finalize } from 'rxjs'
import type { ProjectStatus } from '../shared/model'
import { ProjectsService } from './projects.service'

// #region card
@Component({
  selector: 'app-status-card',
  standalone: true,
  template: `
    <article class="card" [class.down]="!project().healthy">
      <h3>{{ project().displayName }}</h3>
      <p>{{ label() }}</p>
      <button (click)="refresh.emit(project().key)" [disabled]="busy()">Refresh</button>
    </article>
  `,
})
export class StatusCardComponent {
  project = input.required<ProjectStatus>() // in: [project]="p"
  busy = input(false)
  refresh = output<string>() // out: (refresh)="reload($event)"
  // Recomputed only when project() changes.
  label = computed(() => {
    const p = this.project()
    return p.healthy ? (p.summary ?? 'Healthy') : (p.error ?? 'Down')
  })
}
// #endregion

// #region list
@Component({
  selector: 'app-status-list',
  standalone: true,
  imports: [StatusCardComponent],
  template: `
    @if (error()) { <p role="alert">{{ error() }}</p> }
    @for (p of projects(); track p.key) {
      <app-status-card [project]="p" [busy]="busyKey() === p.key" (refresh)="reload($event)" />
    } @empty { <p>Loading…</p> }
  `,
})
export class StatusListComponent implements OnInit {
  private api = inject(ProjectsService)
  // State lives in signals; the template updates when they change.
  projects = signal<ProjectStatus[]>([])
  busyKey = signal<string | null>(null)
  error = signal<string | null>(null)

  ngOnInit() {
    this.api.list().subscribe({ next: (ps) => this.projects.set(ps), error: (e) => this.error.set(e.message) })
  }

  reload(key: string) {
    this.busyKey.set(key)
    this.api
      .status(key)
      .pipe(finalize(() => this.busyKey.set(null)))
      .subscribe({
        next: (fresh) => this.projects.update((ps) => ps.map((p) => (p.key === key ? fresh : p))),
        error: (e) => this.error.set(e.message),
      })
  }
}
// #endregion
