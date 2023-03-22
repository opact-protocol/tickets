import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ToastCustom } from "@/components/shared/toast-custom";

const NeedHelpModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    message: '',
  });

  const onSubmit = () => {
    try {
      axios.post("https://formsubmit.co/ajax/hideyourcash@gmail.com", {
        name,
        email,
        message,
      }, {
        headers: { "Content-Type": "application/json" },
      });
      setName('');
      setEmail('');
      setMessage('');
      onClose();
      toast(
        <ToastCustom
          icon="check-circle-icon.svg"
          title="Message sent"
          message="Thank you for contacting us, your message will be answered shortly."
        />
      );
    } catch (error) {
      console.error(error);
      toast(
        <ToastCustom
          icon="error-circle-icon.svg"
          title="Error sending message"
          message="Something went wrong sending your message, wait a few minutes and try again."
        />
      );
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100000]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-[620px] transform overflow-hidden rounded-[35px] bg-white p-6 text-left align-middle shadow-xl transition-all relative">
                <button
                  onClick={() => onClose()}
                  className="absolute right-[24px] top-[24px] hover:opacity-[0.7]"
                >
                  <XMarkIcon className="text-black w-[24px]" />
                </button>

                <Dialog.Title
                  as="h1"
                  className="text-dark-grafiti-medium text-xl font-bold text-center mb-5"
                >
                  Contact us
                </Dialog.Title>
                <form onSubmit={() => onSubmit()}>
                  <div className="flex flex-col gap-2 mb-2 sm:flex-row">
                    <div className="w-full">
                      <label
                        className={`${
                          errors.name
                            ? "text-error"
                            : "text-dark-grafiti"
                        }`}
                      >
                        Your name{" "}
                        {errors.name && `- ${errors.name}`}
                      </label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        type="text"
                        name="name"
                        placeholder="Write your name here"
                        className={`
                      p-[8px]
                      h-[43px]
                      bg-soft-blue-normal
                      rounded-[15px]
                      text-dark-grafiti-light
                      w-full
                      flex items-center justify-between
                      border-[2px]
                      ${
                        errors.name
                          ? "border-error"
                          : "border-transparent"
                      }
                      focus:outline-none`}
                      />
                    </div>
                    <div className="w-full">
                      <label
                        className={`${
                          errors.email
                            ? "text-error"
                            : "text-dark-grafiti"
                        }`}
                      >
                        Your email{" "}
                        {errors.email && `- ${errors.email}`}
                      </label>
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        name="email"
                        placeholder="example@email.com"
                        className={`p-[8px]
                      h-[43px]
                      bg-soft-blue-normal
                      rounded-[15px]
                      text-dark-grafiti-light
                      w-full
                      flex items-center justify-between
                      border-[2px]
                      ${
                        errors.email
                          ? "border-error"
                          : "border-transparent"
                      }
                      focus:outline-none`}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      className={`${
                        errors.message
                          ? "text-error"
                          : "text-dark-grafiti"
                      }`}
                    >
                      Your message{" "}
                      {errors.message && `- ${errors.message}`}
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      name="message"
                      placeholder="Write your message here"
                      className={`resize-none p-[8px]
                    h-[160px]
                    bg-soft-blue-normal
                    rounded-[15px]
                    text-dark-grafiti-light
                    w-full
                    flex items-center justify-between
                    border-[2px]
                    ${
                      errors.message
                        ? "border-error"
                        : "border-transparent"
                    }
                    focus:outline-none`}
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-soft-blue-from-deep-blue p-[12px] rounded-full block w-full mt-6 mx-auto font-[400] hover:opacity-[.9] disabled:opacity-[.6] disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default NeedHelpModal;
