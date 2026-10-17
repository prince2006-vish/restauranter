import RestaurantSettings from '../models/RestaurantSettings.js';

export const getSettings = async (req, res, next) => {
  try {
    let settings = await RestaurantSettings.findOne();
    if (!settings) {
      settings = await RestaurantSettings.create({});
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    let settings = await RestaurantSettings.findOne();
    if (!settings) {
      settings = new RestaurantSettings();
    }

    Object.assign(settings, req.body);
    await settings.save();

    res.json({
      success: true,
      message: 'Website and restaurant settings updated successfully',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};
