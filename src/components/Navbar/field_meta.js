const field_data = [
  {
    column_name: 'property_address',
    display_name: 'Property Address',
    data_type: 'string',
  },
  {
    column_name: 'property_sleeps',
    display_name: 'Property Sleeps',
    data_type: 'number',
  },
  {
    column_name: 'bedrooms',
    display_name: 'Bedroom(s)',
    data_type: 'number',
  },
  {
    column_name: 'bathrooms',
    display_name: 'Bathroom(s)',
    data_type: 'number',
  },
  {
    column_name: 'access_code',
    display_name: 'Access Code',
    data_type: 'number',
  },
  {
    column_name: 'floor_access',
    display_name: 'Livable Floors',
    data_type: 'string',
  },
  {
    column_name: 'has_dogs',
    display_name: 'Dog Friendly',
    data_type: 'boolean',
  },
  {
    column_name: 'alarm_info',
    display_name: 'Alarm Info',
    data_type: 'string',
  },
  {
    column_name: 'num_tvs',
    display_name: "Total TV's",
    data_type: 'number',
  },
  {
    column_name: 'has_smart_tv',
    display_name: 'Smart TV',
    data_type: 'boolean',
  },
  {
    column_name: 'dvd_player',
    display_name: 'DVD Player',
    data_type: 'boolean',
  },
  {
    column_name: 'stereo',
    display_name: 'Stereo',
    data_type: 'boolean',
  },
  {
    column_name: 'modem_label',
    display_name: 'Modem',
    data_type: 'boolean',
  },
  {
    column_name: 'has_game_room',
    display_name: 'Game Room',
    data_type: 'boolean',
  },
  {
    column_name: 'table_games_ms',
    display_name: 'Table Games',
    data_type: 'multi',
  },
  {
    column_name: 'video_games_ms',
    display_name: 'Video Games',
    data_type: 'multi',
  },
  {
    column_name: 'fireplace_value',
    display_name: 'Fireplace',
    data_type: 'string',
  },
  {
    column_name: 'nat_fiber_carpet',
    display_name: 'Natural Fiber Carpet',
    data_type: 'boolean',
  },
  {
    column_name: 'kitchen_fridge',
    display_name: 'Kitchen Fridge',
    data_type: 'boolean',
  },
  {
    column_name: 'kitchen_oven',
    display_name: 'Kitchen Oven',
    data_type: 'boolean',
  },
  {
    column_name: 'kitchen_microwave',
    display_name: 'Kitchen Microwave',
    data_type: 'boolean',
  },
  {
    column_name: 'has_drip_coffee_maker',
    display_name: 'Drip Coffee Maker',
    data_type: 'boolean',
  },
  {
    column_name: 'kitchen_lobster',
    display_name: 'Lobster Pot',
    data_type: 'boolean',
  },
  {
    column_name: 'has_photos_dishes_cabinet',
    display_name: 'Dish Cabinet',
    data_type: 'boolean',
  },
  {
    column_name: 'kitchen_stove',
    display_name: 'Kitchen Stove',
    data_type: 'boolean',
  },
  {
    column_name: 'kitchen_toaster',
    display_name: 'Kitchen Toaster',
    data_type: 'boolean',
  },
  {
    column_name: 'kitchen_dishw',
    display_name: 'Kitchen Dishwasher',
    data_type: 'boolean',
  },
  {
    column_name: 'kitchen_blender',
    display_name: 'Kitchen Blender',
    data_type: 'boolean',
  },
  {
    column_name: 'kitchen_utensils',
    display_name: 'Kitchen Utensils',
    data_type: 'boolean',
  },
  {
    column_name: 'parking',
    display_name: 'Parking',
    data_type: 'string',
  },
  {
    column_name: 'washer_dryer_location',
    display_name: 'Washer & Dryer',
    data_type: 'number',
  },
  {
    column_name: 'trash_instructions',
    display_name: 'Trash Receptacle Details',
    data_type: 'boolean',
  },
  {
    column_name: 'ac_type',
    display_name: 'A/C',
    data_type: 'multi',
  },
  {
    column_name: 'heating_type',
    display_name: 'Heating',
    data_type: 'multi',
  },
  {
    column_name: 'thermostat_pin',
    display_name: 'Thermostat',
    data_type: 'string',
  },
  {
    column_name: 'circuit_breaker',
    display_name: 'Circuit Breaker Loc',
    data_type: 'string',
  },
  {
    column_name: 'water_shut',
    display_name: 'Water Shut Off Loc',
    data_type: 'string',
  },
  {
    column_name: 'red_burner',
    display_name: 'Red Burner Switch',
    data_type: 'string',
  },
  {
    column_name: 'hot_water_heater',
    display_name: 'Hot Water Heater',
    data_type: 'string',
  },
  {
    column_name: 'fire_exgsh',
    display_name: 'Fire Extinguisher',
    data_type: 'boolean',
  },
  {
    column_name: 'smoke_detectors',
    display_name: 'Smoke Detectors Current',
    data_type: 'boolean',
  },
  {
    column_name: 'electric_meter_loc',
    display_name: 'Electric Meter Location',
    data_type: 'string',
  },
  {
    column_name: 'gas_shutoff',
    display_name: 'Gas Shutoff Valve Location',
    data_type: 'string',
  },
  {
    column_name: 'propane_tank_loc',
    display_name: 'Propane Tank Location',
    data_type: 'string',
  },
  {
    column_name: 'oil_fill_vent_pipe',
    display_name: 'Oil Fill and Vent Pipe',
    data_type: 'string',
  },
  {
    column_name: 'staging_budget',
    display_name: 'Budget',
    data_type: 'string',
  },
  {
    column_name: 'staging_notes',
    display_name: 'Staging Notes',
    data_type: 'text',
  },
  {
    column_name: 'photo_ready',
    display_name: 'Staging Photo Ready',
    data_type: 'date',
  },
  {
    column_name: 'intructions_cleaners',
    display_name: 'Special Instructions for cleaners',
    data_type: 'text',
  },
];

export default field_data;
