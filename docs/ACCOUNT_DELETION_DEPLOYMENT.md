# Account-deletion deployment checklist

The public deletion experience consists of:

- `https://docuflash-frontend.vercel.app/privacy`
- `https://docuflash-frontend.vercel.app/delete-account`
- `https://docuflash-frontend.vercel.app/delete-account/confirm`
- `POST /api/auth/account-deletion/request`

## Required production configuration

1. Set the backend `FRONTEND_URL` to `https://docuflash-frontend.vercel.app`.
2. In Supabase **Authentication → URL Configuration**, set the Site URL to the
   production website and add this exact Redirect URL:
   `https://docuflash-frontend.vercel.app/delete-account/confirm`.
3. In Supabase **Authentication → Email Templates**, configure the Magic Link
   email to identify Novodip and tell the user that it verifies a Docuflash
   account-deletion request. Do not use the password-recovery template for this
   flow.
4. Configure production SMTP in Supabase. The default Supabase email service is
   rate-limited and is not suitable for a production deletion flow.
5. Deploy frontend and backend together. Do not expose the deletion URL in Play
   Console until the deployed form, email link, and confirmation action work.

## Release verification

1. Create a disposable account with an uploaded test document, a share link,
   a file request, a note, and an avatar.
2. While signed out, visit `/delete-account` and submit the account email.
3. Verify the email does not reveal whether an account exists, and that a valid
   account receives the magic link.
4. Open the email link in a clean browser. Confirm the URL has no token after
   the page loads, then select the explicit deletion confirmation.
5. Verify the account can no longer sign in, authenticated API calls fail,
   account-owned documents and links are unavailable, and the account records
   and avatar have been deleted from their providers.
6. Verify the published privacy page, deletion page, and mobile Privacy Policy
   link load over HTTPS without requiring sign-in.
7. Enter `https://docuflash-frontend.vercel.app/delete-account` in Play
   Console’s Data safety account-deletion URL field, then truthfully complete
   the deletion questions.

The deletion request only covers data associated with an authenticated
Docuflash account. Anonymous uploads are not reliably associated with an email
address and instead expire according to their own selected expiry setting.
