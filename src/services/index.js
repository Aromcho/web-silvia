import axios from 'axios';
import { TOKKO_TOKEN, API_URI } from 'config';

interface GetPropertiesProps {
  params: any;
}

interface ContactProps {
  name: string;
  email: string;
  phone: string;
  text?: string;
  property: string;
}

const baseParams = {
  key: TOKKO_TOKEN,
  lang: "es_ar",
  format: "json",
}

export const getProperties = async ({params}: GetPropertiesProps) => {
  const url = `${API_URI}/property/search`;

  let dataParams: any = {
    price_from: params.price_from || 0,
    price_to: params.price_to || 9999999999,
    operation_types: params.operation_types || [1,2,3],
    property_types: params.property_types || [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19],
    with_custom_tags: [],
    currency: "USD",
    filters: [],
    current_localization_type: "division" // division
  };

  if(params.current_localization_id) dataParams['current_localization_id'] = params.current_localization_id;

  if(params.filters) dataParams["filters"] = [...dataParams["filters"], ...params.filters]

  
  let baseParamsExtended = {
    ...baseParams,
    order_by: "price",
    order: params.order || "DESC",
    data: dataParams,
    limit: params.limit || 26,
    offset: params.offset || 0,
  }

  const data = await axios.get(url, { params: baseParamsExtended })
  return data.data;
}

export const getPropertyById = async (id: number) => {
  const url = `${API_URI}/property/${id}`;

  const { data } = await axios.get(url, { params: baseParams })
  return data;
}

export const getDevelopments = async ({params}: GetPropertiesProps) => {
  const url = `${API_URI}/development`;

  let baseParamsExtended = {
    ...baseParams,
    limit: params.limit || 200,
  }

  const { data } = await axios.get(url, { params: baseParamsExtended })
  return data;
}

export const getDevelopmentById = async (id: number) => {
  const url = `${API_URI}/development/${id}`;

  const { data } = await axios.get(url, { params: baseParams })
  return data;
}

export const getPropertyTypes = () => {
  return [
    {key: "Todos", value: -1},
    {key: "Casas", value: 3},
    {key: "Departamentos", value: 2},
    {key: "PH", value: 13},
    {key: "Emprendimientos", value: 4},
    {key: "Terrenos", value: 1},
    {key: "Oficinas", value: 5},
    {key: "Cocheras", value: 10},
    {key: "Locales", value: 7},
    {key: "Campos", value: 9},
  ]
}

export const sendContact = async (params: ContactProps) => {
  const { data } = await axios.post(`/api/contact`, { ...params })
  return data;
}

export const getNeighborhoods = async () => {
  const url = `${API_URI}/property/get_search_summary/`;

  let dataParams: any = {
    price_from: 0,
    price_to: 9999999999,
    operation_types: [1,2,3],
    property_types: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19],
    with_custom_tags: [],
    currency: "USD",
    filters: [],
    current_localization_type: "state" // division
  };

  let baseParamsExtended = {
    ...baseParams,
    order_by: "price",
    order: "DESC",
    data: dataParams,
  }

  const { data }: any = await axios.get(url, { params: baseParamsExtended })
  return data;
}

export const getPropertiesById = async (list: number[] | string) => {
  const url = `${API_URI}/property/`;

  let baseParamsExtended = {
    ...baseParams,
    limit: list.length,
    id__in: typeof list === "string" ? list : list.join(',')
  }

  const { data }: any = await axios.get(url, { params: baseParamsExtended })
  return data;
}


export const getDevelopmentProperties = async (n: number) => {
  const url = `${API_URI}/property/`;

  let baseParamsExtended = {
    ...baseParams,
    development__id: n
  }

  const { data }: any = await axios.get(url, { params: baseParamsExtended })
  return data;
}