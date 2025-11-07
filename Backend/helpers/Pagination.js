/* 
example: queryOptions
    {
        where: filters,
        order: [['createdAt', 'DESC']],
    },
*/
export async function paginate(model, queryOptions = {}, page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit;
    const { count, rows } = await model.findAndCountAll({
      ...queryOptions,
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    return {
      success: true,
      data: rows,
      total: count,
      page,
      totalPages,
      limit,
    };
  } catch (error) {
    return { success: false, error };
  }
}
