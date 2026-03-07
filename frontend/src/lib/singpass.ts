/**
 * Shape of personal info we get from SingPass/MyInfo (for prefill on sign-up).
 * In production this would come from the SingPass/MyInfo API response.
 */
export interface SingpassPrefill {
  fullName: string
  icNumber: string
  dateOfBirth: string
  homeAddress: string
  postalCode: string
  contactNumber: string
  email: string
}

/** Mock: simulates fetching user data after SingPass app authorisation. Replace with real MyInfo/SingPass API. */
export async function fetchMyInfoAfterSingpassAuth(
  _sessionId: string
): Promise<SingpassPrefill> {
  await new Promise((r) => setTimeout(r, 1200))
  return {
    fullName: "Ahmad bin Abdullah",
    icNumber: "S1234567D",
    dateOfBirth: "1985-06-15",
    homeAddress: "123 Bedok North Avenue 4 #12-345",
    postalCode: "460123",
    contactNumber: "+65 9123 4567",
    email: "ahmad.abdullah@example.com",
  }
}
