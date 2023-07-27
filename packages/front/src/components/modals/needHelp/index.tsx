import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { toast } from "react-toastify";
import { ToastCustom } from "@/components/toast-custom";
import { twMerge } from 'tailwind-merge';
import { Button } from "@/components/button";

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
    if (form[key] === value) {
      return;
    }

    setForm({
      ...form,
      [key]: value,
    });

    handleTouch(key);
  }

  const onSubmit = async () => {
    try {
      fetch(
        'https://formsubmit.co/ajax/hideyourcash@gmail.com',
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form)
        }
      );

      setForm({ ...baseForm });
      setTouched({ ...baseTouched });

      onClose();

      toast(
        <ToastCustom
          variant="success"
          title="Message sent"
          message="Thank you for contacting us, your message will be answered shortly."
        />
      );
    } catch (error) {

      toast(
        <ToastCustom
          variant="error"
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
              <Dialog.Panel className="w-full max-w-[598px] transform overflow-hidden rounded-[8px] bg-form-gradient border-[1px] border-[#606466] px-[24px] py-[32px] text-center transition-all relative">
                <div
                  className="space-y-[16px] pb-[24px]"
                >
                  <Dialog.Title
                    as="h1"
                    className="
                      text-[#FAFAFA]
                      font-tile
                      text-[18px]
                      font-[500]
                      leading-[18px]
                    "
                  >
                    Contact us
                  </Dialog.Title>

                  <span
                    className="block text-[#BDBDBD] text-[15px] leading-[22.5px] font-[500]"
                  >
                    Having issues or questions about Opact Tickets? Send us a message
                  </span>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit();
                  }}
                  className="w-full "
                >
                  <div className="flex flex-col gap-4 sm:flex-row ">
                    <div className="w-full pb-4">
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
                        placeholder="Name"
                        className={twMerge(`
                        w-full
                        px-[20px]
                        py-[18px]
                        rounded-[8px]
                        text-base
                        font-title
                        leading-[20px]
                        disabled:cursor-not-allowed
                        text-dark-blue
                        placeholder:text-dark-blue`, touched.name && 'invalid:border-error' )}
                      />
                    </div>

                    <div className="w-full">
                      <input
                        id="contact-us-email"
                        value={form.email}
                        onChange={(e) => handleForm('email', e.target.value)}
                        name="email"
                        type="email"
                        required
                        placeholder="E-mail"
                        className={twMerge(`
                        w-full
                        px-[20px]
                        py-[18px]
                        rounded-[8px]
                        text-base
                        font-title
                        leading-[20px]
                        disabled:cursor-not-allowed
                        text-dark-blue
                        placeholder:text-dark-blue`, touched.email && 'invalid:border-error')}
                      />
                    </div>
                  </div>

                  <div
                    className="pb-[40px]"
                  >
                    <textarea
                      value={form.message}
                      onChange={(e) => handleForm('message', e.target.value)}
                      name="message"
                      required
                      placeholder="Message"
                      className={twMerge(`
                      w-full
                      px-[20px]
                      py-[18px]
                      rounded-[8px]
                      text-base
                      font-title
                      leading-[20px]
                      disabled:cursor-not-allowed
                      text-dark-blue
                      placeholder:text-dark-blue`, touched.message && 'invalid:border-error')}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={false}
                    isLoading={false}
                    text="Send"
                />
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
