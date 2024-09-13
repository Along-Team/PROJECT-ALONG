export type DriverSignUpResponse = { ok: boolean; error: string };

export type Config = {
  apiKey: string;
};

export type Driver = {
  // id: number;
  username: string;
  email: string;
  password: string;
  phone: string;
  car: string;
  license: string;
  carYear: string;
  carModel: string;
  carColor: string;
  carPlate: string;
};
