import { useQuery } from '@tanstack/react-query';
import { getAds } from '../api/kioskApis';
function useAds() {
  return useQuery({
    queryKey: ['ads'],
    queryFn: async () => getAds(),
  });
}

export default useAds;
