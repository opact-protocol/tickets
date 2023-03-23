import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment, useState } from "react";
import { toast } from "react-toastify";
import { ToastCustom } from "@/components/shared/toast-custom";
import { twMerge } from 'tailwind-merge';

const baseForm = {
  name: '',
  email: '',
  message: '',
}

const baseTouched = {
  name: false,
  email: false,
  message: false,
}


const NeedHelpModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [form, setForm] = useState({ ...baseForm });
  const [touched, setTouched] = useState({ ...baseTouched })

  const handleTouch = (key: string) => {
    if (touched[key]) {
      return;
    }

    setTouched({ ...touched, [key]: true });
  };

  const handleForm = (key: string, value: string) => {
    console.log('formkeytrigger', key);

    if (form[key] === value) {
      return;
    }

    setForm({
      ...form,
      [key]: value,
    });

    handleTouch(key);
  }

  const onSubmit = () => {
    try {
      fetch(
        'https://formsubmit.co/ajax/hideyourcash@gmail.com',
        {
          method: "POST",
          body: JSON.stringify(form)
        }
      );

      setForm({ ...baseForm });
      setTouched({ ...baseTouched });

      onClose();

      toast(
        <ToastCustom
          icon="check-circle-icon.svg"
          title="Message sent"
          message="Thank you for contacting us, your message will be answered shortly."
        />
      );
    } catch (error) {

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
      <Dialog as="div" className="relative z-[100000]" onClose={() => {
        onClose();
        setForm({ ...baseForm });
        setTouched({ ...baseTouched });
      }}>
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
                  onClick={() => {
                    onClose();
                    setForm({ ...baseForm });
                    setTouched({ ...baseTouched });
                  }}
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

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit();
                  }}
                >
                  <div className="flex flex-col gap-2 mb-2 sm:flex-row">
                    <div className="w-full">
                      <label
                        className="text-dark-grafiti"
                      >
                        Your name
                      </label>

                      <input
                        value={form.name}
                        onChange={(e) => {
                          handleForm('name', e.target.value);
                        }}
                        type="text"
                        name="name"
                        pattern=".{3,}"
                        title="2 characters minimum"
                        required
                        placeholder="Write your name here"
                        className={twMerge("p-[8px] h-[43px] bg-soft-blue-normal rounded-[15px] text-dark-grafiti-light w-full flex items-center justify-between border-[2px] border-transparent focus:outline-none", touched.name && 'invalid:border-error' )}
                      />
                    </div>

                    <div className="w-full">
                      <label
                        className="text-dark-grafiti"
                      >
                        Your email
                      </label>

                      <input
                        id="contact-us-email"
                        value={form.email}
                        onChange={(e) => handleForm('email', e.target.value)}
                        name="email"
                        type="email"
                        required
                        placeholder="example@email.com"
                        className={twMerge("p-[8px] h-[43px] bg-soft-blue-normal rounded-[15px] text-dark-grafiti-light w-full flex items-center justify-between border-[2px] border-transparent focus:outline-none", touched.email && 'invalid:border-error')}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="text-dark-grafiti"
                    >
                      Your message
                    </label>

                    <textarea
                      value={form.message}
                      onChange={(e) => handleForm('message', e.target.value)}
                      name="message"
                      required
                      placeholder="Write your message here"
                      className={twMerge("w-full h-[160px] border-[2px] rounded-[15px] resize-none p-[8px] border-transparent focus:outline-none bg-soft-blue-normal text-dark-grafiti-light flex items-center justify-between", touched.message && 'invalid:border-error')}
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
