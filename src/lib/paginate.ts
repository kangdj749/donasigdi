export function paginate<T>(
  items: T[],
  page: number,
  limit: number
) {
  const total = items.length;
  const totalPages = Math.ceil(total / limit);

  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    data: items.slice(start, end),
    total,
    totalPages,
    page,
  };
}
