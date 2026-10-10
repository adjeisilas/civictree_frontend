import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppLayout } from '../../components/website/AppLayout';
import { SectionWrapper, Button } from '../../components/website/ui';
import { seoConfigs } from '../../config/seo';
import { CheckCircle2, MapPin, Phone, Mail, MessageCircle } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export const ContactPage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    const subject = encodeURIComponent(`Contact Form: ${data.name}`);
    const body = encodeURIComponent(
      `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || 'N/A'}\n\nMessage:\n${data.message}`
    );
    window.location.assign(`mailto:gyasireindorf42@gmail.com?subject=${subject}&body=${body}`);
    setIsSubmitted(true);
  };

  return (
    <AppLayout seoConfig={seoConfigs.contact}>
      <div>
        {/* Contact Section */}
        <SectionWrapper>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label className="block font-sans font-semibold text-text-primary mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your name in full"
                      {...register('name')}
                      className="w-full px-4 py-3 rounded-lg border border-border focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-sans font-semibold text-text-primary mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder=""
                      {...register('email')}
                      className="w-full px-4 py-3 rounded-lg border border-border focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-sans font-semibold text-text-primary mb-2">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder=""
                      {...register('phone')}
                      className="w-full px-4 py-3 rounded-lg border border-border focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-sans font-semibold text-text-primary mb-2">
                      Message *
                    </label>
                    <textarea
                      placeholder="Tell us how we can help..."
                      rows={6}
                      {...register('message')}
                      className="w-full px-4 py-3 rounded-lg border border-border focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none resize-none"
                    />
                    {errors.message && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="cta"
                    size="lg"
                    loading={isSubmitting}
                    className="w-full"
                  >
                    Send Message
                  </Button>

                  {isSubmitted && (
                    <motion.div
                      className="p-4 bg-success/10 text-success rounded-lg text-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <CheckCircle2 size={24} className="text-success" />
                      Message sent successfully! We'll respond soon.
                    </motion.div>
                  )}
                </form>
              </motion.div>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="space-y-8"
              >
                <div className="glass-card p-8">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl text-primary">
                         <MapPin size={32} />
                      </div>
                    <div>
                      <h3 className="font-heading font-bold text-text-primary mb-2">
                        Our Location
                      </h3>
                      <p className="font-sans text-text-secondary">
                        Kumasi, Ghana
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-8">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl text-primary">
                         <Phone size={32} />
                      </div>
                    <div>
                      <h3 className="font-heading font-bold text-text-primary mb-2">
                        Phone
                      </h3>
                      <a
                        href="tel:0556069880"
                        className="font-sans text-primary hover:underline"
                      >
                        0556069880
                      </a>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-8">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl text-primary">
                         <Mail size={32} />
                      </div>
                    <div>
                      <h3 className="font-heading font-bold text-text-primary mb-2">
                        Email
                      </h3>
                      <a
                        href="mailto:gyasireindorf42@gmail.com"
                        className="font-sans text-primary hover:underline"
                      >
                        gyasireindorf42@gmail.com
                      </a>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-8">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl text-primary">
                         <MessageCircle size={32} />
                      </div>
                    <div>
                      <h3 className="font-heading font-bold text-text-primary mb-2">
                        WhatsApp
                      </h3>
                      <a
                        href="https://wa.me/233556069880?text=Hi%20CivicTree%2C%20I%20am%20having%20difficulty%20purchasing%20a%20voucher.%20Can%20you%20help%20me%3F"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-sans text-primary hover:underline"
                      >
                        0556069880
                      </a>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-8">
                  <h3 className="font-sans font-bold text-text-primary mb-4">
                    Operating Hours
                  </h3>
                  <div className="space-y-2 font-sans text-sm text-text-secondary">
                    <div className="flex justify-between">
                      <span>Monday - Friday</span>
                      <span className="font-semibold">9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday</span>
                      <span className="font-semibold">10:00 AM - 3:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday</span>
                      <span className="font-semibold text-red-500">Closed</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </SectionWrapper>
      </div>
    </AppLayout>
  );
};
