export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export type Address = `0x${string}`;

export type PageProps = {
  params: Record<string, string>;
  searchParams: Record<string, string | string[] | undefined>;
};
