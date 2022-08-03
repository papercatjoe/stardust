import * as request from './request'

export type HealthCheckStatus = 'OK'

export type HealthCheckResult = {
  status: HealthCheckStatus;
}

export const check = () => request.core<HealthCheckResult>(undefined, 'get', 'health')
