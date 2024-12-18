import Emoji from "../Emoji";
import Attachment from "../Attachment";
import Mic from "../Mic";
import Input from "../Input";
import { RootState } from "../../store/store";
import { useSelector } from "react-redux";
import Send from "../Send";

function InputAndReaction({chatId}: {chatId: string}) {
  const { newMessage } = useSelector((state: RootState) => state.message);
  return (
    <div className="border-t border-l border-[--main-background-color]">
      <div className="emojiAttachmentInputMic p-2 flex items-center">
        <div className="emoji p-3 aspect-square flex items-center rounded-md hover:bg-[--chat-hover-color]">
          <Emoji />
        </div>
        <div className="attachment p-3 aspect-square flex items-center rounded-md hover:bg-[--chat-hover-color]">
          <Attachment />
        </div>
        <div className="input w-[-webkit-fill-available]">
          <Input chatId={chatId} />
        </div>
        <div className="mic flex items-center aspect-square rounded-md hover:bg-[--chat-hover-color]">
          {newMessage ? <Send chatId={chatId} /> : <Mic />}
        </div>
      </div>
    </div>
  );
}

export default InputAndReaction;
