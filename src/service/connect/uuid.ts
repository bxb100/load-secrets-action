/**
 * https://github.com/1Password/onepassword-operator/blob/ced45c33d4c1e0267dc5af54231c5a29accce4c4/pkg/onepassword/uuid.go#L7
 *
 * @param uuid check this is a valid client uuid, otherwise is title
 */
export function is_valid_client_uuid(uuid: string): boolean {
  const regex = /[a-z0-9]{26}/
  return regex.test(uuid)
}
