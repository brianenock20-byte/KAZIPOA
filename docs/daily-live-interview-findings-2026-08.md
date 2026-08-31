# Daily.co live interview integration findings

Daily's official REST API uses `https://api.daily.co/v1` with bearer authentication. Room creation is `POST /rooms`; the room can be private and can include `properties.nbf` and `properties.exp` Unix timestamps so the room is available only during its scheduled window. The API returns a room URL and room name. [1]

Meeting-token creation is `POST /meeting-tokens`. The token request should set `room_name`, `user_id`, `user_name`, `nbf`, and `exp`; Daily documents `eject_at_token_exp` for removing a participant when the token expires and `is_owner` for host privileges. Kazipoa should issue the employer token with owner privileges and the candidate token without owner privileges. [2]

The Daily API key must remain server-only. Kazipoa should never send it to the browser, store it in a database record, or place it in a public URL. The browser should receive only an expiring meeting token and the Daily room URL after the server verifies the authenticated employer/candidate relationship.

The integration should remain provider-not-configured until `DAILY_API_KEY` is supplied. Email can use the existing Postmark adapter. SMS requires a separate approved Tanzania SMS provider and its credentials; the Daily key alone cannot send SMS.

## References

[1]: https://docs.daily.co/reference/rest-api/rooms/create-room "Daily Create Room API"

[2]: https://docs.daily.co/reference/rest-api/meeting-tokens/create-meeting-token "Daily Create Meeting Token API"
