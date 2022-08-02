import * as request from './request'

export type HealthCheckStatus = 'OK'

export type HealthCheckResult = {
  status: HealthCheckStatus;
}

export const check = async () => request.core<HealthCheckResult>(undefined, 'get', 'health')
