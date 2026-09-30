export const queryKeys = {
  stats: ["stats"],
  clients: {
    all: ["clients"],
    options: ["clients", "options"],
    page: (page, size, search) => ["clients", "page", { page, size, search }],
    summary: ["clients", "summary"],
  },
  products: {
    all: ["products"],
    categories: ["categories"],
  },
  sales: {
    all: ["sales"],
    page: (page, size, search, status) => ["sales", "page", { page, size, search, status }],
    summary: ["sales", "summary"],
    detail: (id) => ["sales", "detail", id],
    history: (clientId) => ["sales", "client", clientId],
  },
  accessRequests: ["access-requests"],
};

