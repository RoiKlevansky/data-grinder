import Jimp from "jimp";
import { getRepository } from "typeorm";
import wa from "whatsapp-web.js";
import { Contact } from "../entities/Contact";
import { removeEmojis, reverseHe } from "../utils/stringUtils";

/**
 * Draws profile pic to image.
 * @param {Jimp} src
 * @param {string} profilePicUrl
 * @param {number} width
 * @param {number} height
 * @param {number} x
 * @param {number} y
 * @return {Promise<void>}
 */
const drawProfilePic = async (src: Jimp, profilePicUrl: string, width: number, height: number, x: number, y: number): Promise<void> => {
  if (!profilePicUrl) {
    return;
  }
  const profilePic = await Jimp.read(profilePicUrl).
    catch((err) => console.error(err));
  if (!profilePic) {
    return;
  }
  const profilePicMask = await Jimp.read("./assets/profile-pic-mask.png");
  profilePicMask.resize(src.getWidth(), src.getHeight());
  profilePic.resize(src.getWidth(), src.getHeight());
  profilePic.mask(profilePicMask, 0, 0);
  profilePic.resize(src.getWidth() * width, src.getHeight() * height);
  const template = new Jimp(src.getWidth(), src.getHeight());
  template.composite(profilePic, src.getWidth() * x, src.getHeight() * y);
  template.shadow({ opacity: 0.2, size: 1, blur: 10, x: 0, y: 0 });
  src.composite(template, 0, 0);
}

/**
 * Print name on src.
 * @param {Jimp} src 
 * @param {string} name
 * @param {number} x 
 * @param {number} y 
 */
const printName = async (src: Jimp, name: string, x: number, y: number) => {
  const nameFont = await Jimp.loadFont("./assets/fonts/names.fnt");
  const displayName = removeEmojis(reverseHe(name));
  src.print(nameFont, src.getWidth() * x, src.getHeight() * y, {
    text: displayName,
    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
  }, src.getWidth(), src.getHeight());
}

/**
 * Prints karma on src.
 * @param {Jimp} src 
 * @param {string} karma 
 * @param {number} x 
 * @param {number} y 
 */
const printKarma = async (src: Jimp, karma: string, x: number, y: number) => {
  const karmaFont = await Jimp.loadFont("./assets/fonts/karma.fnt");
  src.print(karmaFont, src.getWidth() * x, src.getHeight() * y, {
    text: reverseHe(karma),
    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
  }, src.getWidth(), src.getHeight());
}


/**
 * Executes the command.
 * @param {wa.Message} msg 
 */
export const karmaCommand = async (msg: wa.Message): Promise<void> => {
  const contactRepository = getRepository(Contact);

  const contact: wa.Contact = await msg.getContact();
  const contactEntry = await contactRepository.findOne({ id: contact.id._serialized });
  if (!contactEntry) {
    return;
  }

  const background: Jimp = await Jimp.read("./assets/karma-background.png");
  const karma: number = contactEntry ? contactEntry.karma : 0;
  const backgroundMask = await Jimp.read('./assets/background-mask.png');
  backgroundMask.resize(background.getWidth(), background.getHeight());
  background.mask(backgroundMask, 0, 0);
  const profilePicUrl = await contact.getProfilePicUrl();
  await drawProfilePic(background, profilePicUrl, 0.6, 0.6, 0.2, 0.05);
  await printName(background, contactEntry.name, 0, 0.675);
  await printKarma(background, karma.toString() + " karma", 0, 0.8);

  const result = (await background.getBase64Async(Jimp.MIME_PNG)).split(',')[1];
  await msg.reply(new wa.MessageMedia(Jimp.MIME_PNG, result, 'karma.png'), undefined, { sendMediaAsSticker: true });
}
