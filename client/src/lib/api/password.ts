import { apiClient } from "./client";

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
}

export class PasswordAPI {
  /**
   * Change user password (requires auth)
   */
  static async changePassword(
    data: ChangePasswordRequest
  ): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      "/password/change",
      data
    );
    return response.data;
  }
}
