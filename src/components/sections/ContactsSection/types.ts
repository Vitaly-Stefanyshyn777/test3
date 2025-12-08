export type TrainerUser = {
  id: number;
  name?: string;
  locations?: string | string[];
  avatar?: string | string[];
  my_specialty?: string[] | string;
  experience?: string;
  super_power?: string;
  favourite_exercise?: string[] | string;
  my_experience?: Array<{
    hl_input_text_gym?: string;
    hl_input_date_date_start?: string;
    hl_input_date_date_end?: string;
    hl_textarea_ex_description?: string;
  }>;
  my_wlocation?: Array<{
    hl_input_text_title?: string;
    hl_input_text_email?: string;
    hl_input_text_phone?: string;
    hl_input_text_schedule_five?: string;
    hl_input_text_schedule_two?: string;
    hl_input_text_address?: string;
    hl_input_text_coord_lat?: string;
    hl_input_text_coord_ln?: string;
    coord_lat?: string;
    coord_lng?: string;
    latitude?: string | number;
    longitude?: string | number;
    lat?: string | number;
    lng?: string | number;
  }>;
  gallery?: string | string[];
  certificate?: string | string[];
  map_markers?: Array<{
    title: string;
    coordinates: [number, number][];
  }>;
  input_text_phone?: string;
  input_text_schedule?: string;
  input_text_email?: string;
  input_text_address?: string;
  hl_data_contact?: Array<{
    hl_input_text_name: string;
    hl_input_text_link: string;
    hl_img_svg_icon: string;
  }>;
  hl_data_gallery?: Array<{
    hl_img_link_photo: string[];
  }>;
  social_phone?: string;
  location_city?: string;
  location_country?: string;
};
