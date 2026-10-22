import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import type { Observable } from 'rxjs'
import type { CreateProject, ProjectStatus } from '../shared/model'

export const API_BASE = '/api'

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private http = inject(HttpClient)

  list(): Observable<ProjectStatus[]> {
    return this.http.get<ProjectStatus[]>(`${API_BASE}/projects`)
  }

  status(key: string): Observable<ProjectStatus> {
    return this.http.get<ProjectStatus>(`${API_BASE}/projects/${encodeURIComponent(key)}`)
  }

  create(p: CreateProject): Observable<ProjectStatus> {
    return this.http.post<ProjectStatus>(`${API_BASE}/projects`, p)
  }
}
