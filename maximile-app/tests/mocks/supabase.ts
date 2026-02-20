/**
 * MaxiMile Supabase Client Mock
 *
 * Provides a fully chainable mock for the Supabase JS client.
 * Each query-builder method returns `this` so chains like
 *   supabase.from('cards').select('*').eq('id', x).single()
 * work correctly in tests.
 *
 * Usage:
 *   const { supabase, mockFrom, mockRpc, mockAuth, resetMocks } = createMockSupabase();
 *
 * Then configure responses per test:
 *   mockFrom.mockResolvedData(myData);           // for .from() chains
 *   mockRpc.mockResolvedValue({ data: [...] });   // for .rpc() calls
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SupabaseResponse<T = unknown> {
  data: T | null;
  error: SupabaseError | null;
  count?: number;
  status?: number;
  statusText?: string;
}

interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

// ---------------------------------------------------------------------------
// Query Builder Mock
// ---------------------------------------------------------------------------

/**
 * A mock query builder that supports all the Supabase PostgREST chaining
 * methods. It stores the final resolved value and returns it when awaited
 * via `then()`.
 */
export class MockQueryBuilder {
  private _resolvedValue: SupabaseResponse = { data: null, error: null };

  // -- Configuration --

  /** Set what this chain will resolve to. */
  setResponse(response: SupabaseResponse): void {
    this._resolvedValue = response;
  }

  /** Shorthand: set a successful data response. */
  setData<T>(data: T): void {
    this._resolvedValue = { data, error: null };
  }

  /** Shorthand: set an error response. */
  setError(error: SupabaseError): void {
    this._resolvedValue = { data: null, error };
  }

  // -- PostgREST chaining methods (all return `this`) --

  select(_columns?: string): this { return this; }
  insert(_values: unknown, _options?: unknown): this { return this; }
  upsert(_values: unknown, _options?: unknown): this { return this; }
  update(_values: unknown, _options?: unknown): this { return this; }
  delete(): this { return this; }

  eq(_column: string, _value: unknown): this { return this; }
  neq(_column: string, _value: unknown): this { return this; }
  gt(_column: string, _value: unknown): this { return this; }
  gte(_column: string, _value: unknown): this { return this; }
  lt(_column: string, _value: unknown): this { return this; }
  lte(_column: string, _value: unknown): this { return this; }
  like(_column: string, _pattern: string): this { return this; }
  ilike(_column: string, _pattern: string): this { return this; }
  is(_column: string, _value: unknown): this { return this; }
  in(_column: string, _values: unknown[]): this { return this; }
  contains(_column: string, _value: unknown): this { return this; }
  containedBy(_column: string, _value: unknown): this { return this; }
  filter(_column: string, _operator: string, _value: unknown): this { return this; }
  not(_column: string, _operator: string, _value: unknown): this { return this; }
  or(_filters: string, _options?: unknown): this { return this; }
  match(_query: Record<string, unknown>): this { return this; }

  order(_column: string, _options?: { ascending?: boolean }): this { return this; }
  limit(_count: number): this { return this; }
  range(_from: number, _to: number): this { return this; }
  single(): this { return this; }
  maybeSingle(): this { return this; }

  // -- Thenable: allows `await supabase.from(...).select(...)` --

  then<TResult1 = SupabaseResponse, TResult2 = never>(
    onfulfilled?: ((value: SupabaseResponse) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve(this._resolvedValue).then(onfulfilled, onrejected);
  }
}

// ---------------------------------------------------------------------------
// Auth Mock
// ---------------------------------------------------------------------------

export class MockAuth {
  private _user: unknown = null;
  private _session: unknown = null;

  setUser(user: unknown): void { this._user = user; }
  setSession(session: unknown): void { this._session = session; }

  getUser(): Promise<{ data: { user: unknown }; error: null }> {
    return Promise.resolve({ data: { user: this._user }, error: null });
  }

  getSession(): Promise<{ data: { session: unknown }; error: null }> {
    return Promise.resolve({ data: { session: this._session }, error: null });
  }

  signInWithPassword(_credentials: unknown): Promise<{ data: { user: unknown; session: unknown }; error: null }> {
    return Promise.resolve({ data: { user: this._user, session: this._session }, error: null });
  }

  signUp(_credentials: unknown): Promise<{ data: { user: unknown; session: unknown }; error: null }> {
    return Promise.resolve({ data: { user: this._user, session: this._session }, error: null });
  }

  signOut(): Promise<{ error: null }> {
    return Promise.resolve({ error: null });
  }

  onAuthStateChange(_callback: unknown): { data: { subscription: { unsubscribe: () => void } } } {
    return { data: { subscription: { unsubscribe: jest.fn() } } };
  }
}

// ---------------------------------------------------------------------------
// RPC Mock
// ---------------------------------------------------------------------------

export class MockRpc {
  private _responses: Map<string, SupabaseResponse> = new Map();

  /** Register a response for a given function name. */
  setResponse(fnName: string, response: SupabaseResponse): void {
    this._responses.set(fnName, response);
  }

  /** Shorthand: register a successful data response. */
  setData<T>(fnName: string, data: T): void {
    this._responses.set(fnName, { data, error: null });
  }

  /** Shorthand: register an error response. */
  setError(fnName: string, error: SupabaseError): void {
    this._responses.set(fnName, { data: null, error });
  }

  /** Called by the mock supabase client when `supabase.rpc(name, params)` is invoked. */
  call(fnName: string, _params?: unknown): Promise<SupabaseResponse> {
    const response = this._responses.get(fnName);
    if (response) {
      return Promise.resolve(response);
    }
    return Promise.resolve({ data: null, error: { message: `No mock registered for RPC "${fnName}"`, code: 'MOCK_MISSING' } });
  }
}

// ---------------------------------------------------------------------------
// Factory: createMockSupabase()
// ---------------------------------------------------------------------------

export interface MockSupabaseClient {
  supabase: {
    from: (table: string) => MockQueryBuilder;
    rpc: (fnName: string, params?: unknown) => Promise<SupabaseResponse>;
    auth: MockAuth;
  };
  /** The query builder returned by the most recent `from()` call. */
  queryBuilder: MockQueryBuilder;
  /** Map of table-name -> MockQueryBuilder for per-table config. */
  queryBuilders: Map<string, MockQueryBuilder>;
  mockAuth: MockAuth;
  mockRpc: MockRpc;
  /** Reset all mocks to default (empty) state. */
  resetMocks: () => void;
}

export function createMockSupabase(): MockSupabaseClient {
  const queryBuilders = new Map<string, MockQueryBuilder>();
  const mockAuth = new MockAuth();
  const mockRpc = new MockRpc();

  let latestBuilder: MockQueryBuilder = new MockQueryBuilder();

  function getBuilder(table: string): MockQueryBuilder {
    if (!queryBuilders.has(table)) {
      queryBuilders.set(table, new MockQueryBuilder());
    }
    latestBuilder = queryBuilders.get(table)!;
    return latestBuilder;
  }

  const supabase = {
    from: (table: string) => getBuilder(table),
    rpc: (fnName: string, params?: unknown) => mockRpc.call(fnName, params),
    auth: mockAuth,
  };

  function resetMocks(): void {
    queryBuilders.clear();
    latestBuilder = new MockQueryBuilder();
  }

  return {
    supabase,
    get queryBuilder() { return latestBuilder; },
    queryBuilders,
    mockAuth,
    mockRpc,
    resetMocks,
  };
}
