import { useMutation } from '@tanstack/react-query';
import {
  ApiError,
  ApiValidationError,
  createToken,
  CreateTokenPayload,
  CreateTokenResponse,
} from '../api/kioskApis';

const useCreateToken = () => {
  return useMutation<
    CreateTokenResponse,
    ApiError | ApiValidationError,
    CreateTokenPayload
  >({
    mutationFn: createToken,
  });
};

export default useCreateToken;
