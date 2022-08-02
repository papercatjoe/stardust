import * as common from './common'

export type HealthCheckStatus = 'OK'

export type HealthCheckResult = {
  status: HealthCheckStatus;
}

export const check = async () => common.core<HealthCheckResult>(undefined, 'get', 'health')
