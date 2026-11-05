import { queryOptions } from '@tanstack/react-query'
import { getAwsConnection } from './requests'

export const awsConnectionQueries = {
  all: () => ['aws-connection'] as const,
  detail: (projectId: number) =>
    queryOptions({
      queryKey: [...awsConnectionQueries.all(), projectId],
      queryFn: () => getAwsConnection(projectId),
    }),
}
