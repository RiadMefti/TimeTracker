export default interface IApiResponse<T> {
  Success: boolean;
  Data?: T;
  Message: string;
}
