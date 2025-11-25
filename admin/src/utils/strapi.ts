import axios from 'axios';
import qs from 'qs';

interface IStrapiRepository {
  findMany: <T>(params: FindManyParams) => Promise<T>;
  delete: <T>(params: DeleteParams) => Promise<T>;
  create: <T>(params: CreateParams) => Promise<T>;
  uploadMedia: (file: File) => Promise<any>;
  findOne: <T>(params: FindOneParams) => Promise<T>;
  update: <T>(params: UpdateParams) => Promise<T>;
}

type FindManyParams = {
  url: string;
  sort?: object;
  limit?: number;
  start?: number;
  filters?: object;
  fields?: string[];
  populate?: object;
};

type FindOneParams = {
  url: string;
  populate?: object;
};

type DeleteParams = {
  url: string;
};

type CreateParams = {
  url: string;
  data: any;
  populate?: object;
};

type UpdateParams = {
  url: string;
  data: any;
  populate?: object;
};

export const strapiF: IStrapiRepository = {
  findMany: async <T>(params: FindManyParams) => {
    const urlParams = qs.stringify(
      {
        populate: params?.populate,
        fields: params?.fields,
        filters: params?.filters,
        limit: params?.limit,
        start: params?.start,
        sort: params?.sort,
      },
      {
        encodeValuesOnly: true,
      }
    );

    const { data } = await axios.get(`/api${params.url}?${urlParams}`);

    return data as T;
  },

  delete: async <T>(params: DeleteParams) => {
    const { data } = await axios.delete(`/api${params.url}`);

    return data as T;
  },

  findOne: async <T>(params: FindOneParams) => {
    const urlParams = qs.stringify(
      {
        populate: params?.populate,
      },
      {
        encodeValuesOnly: true,
      }
    );

    const { data } = await axios.get(`/api${params.url}?${urlParams}`);

    return data as T;
  },

  create: async <T>(params: CreateParams) => {
    const urlParams = qs.stringify(
      {
        populate: params?.populate,
      },
      {
        encodeValuesOnly: true,
      }
    );
    const { data } = await axios.post(`/api${params.url}?${urlParams}`, params.data);

    return data as T;
  },

  update: async <T>(params: UpdateParams) => {
    const { data } = await axios.put(`/api${params.url}`, params.data);

    return data as T;
  },

  uploadMedia: async (file: File) => {
    const form = new FormData();
    form.append('files', file);
    const data = await axios.post(`/api/upload`, form);
    return data;
  },
};
