'use client';
//ilmselgelt kasutatud ai abi
import { useState } from 'react';
import { Button, TextInput, Textarea, Group, Box, Title, Text, Loader } from '@mantine/core';
import { useForm } from '@mantine/form';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: number;
  message: string;
}

interface ContactFormClientProps { initialContacts: Contact[];}

export default function ContactFormClient({ initialContacts}: ContactFormClientProps) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      first_name: 'eesnimi',
      last_name: 'perenimi',
      email: 'jeemail',
      phone: 'telofeen',
      message: 'sõnum vms',
    },
    validate: {
      first_name: (value) => (value.trim().length > 0 ? null : 'Eesnimi hädavajalik'),
      last_name: (value) => (value.trim().length > 0 ? null : 'afternimi hädavajalik'),
      email: (value) => (value.trim().length > 0 ? null : 'tahax naq emaili '),
      phone: (value) => (value.trim().length > 0 ? null : 'ükski spioneerimine pole täielik ilma telonumrita'),
      message: (value) => (value.trim().length > 0 ? null : 'Ilma sõnumitta sisse ei lasta'),
    },
  });

  //kontaktide submittimine
  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          first_name: values.first_name.trim(),
          last_name: values.last_name.trim(),
          email: values.email.trim(),
          phone: parseInt(values.phone),
          message: values.message.trim(),
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Feilisime kontakti submitiga');
      }

      const newContact = await response.json();
      setContacts([newContact, ...contacts]); // Add new contact to state
      form.reset(); // Reset form
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'feil kontakti submitiga';
      setError(errorMessage);
      console.error('Submit contact error:', err);
    } finally {
      setLoading(false);
    }
  };

return (
    <Box maw={600} mx="auto" p="lg">
      <Title order={2} mb="lg" ta="center">
        Contact Form
      </Title>

      {/* Contact Form */}
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="First Name"
          placeholder="Enter your first name"
          {...form.getInputProps('first_name')}
          disabled={loading}
          mb="sm"
        />
        <TextInput
          label="Last Name"
          placeholder="Enter your last name"
          {...form.getInputProps('last_name')}
          disabled={loading}
          mb="sm"
        />
        <TextInput
          label="Email"
          placeholder="Enter your email"
          {...form.getInputProps('email')}
          disabled={loading}
          mb="sm"
        />
        <TextInput
          label="Phone"
          placeholder="Enter your phone number"
          {...form.getInputProps('phone')}
          disabled={loading}
          mb="sm"
        />
        <Textarea
          label="Message"
          placeholder="Enter your message"
          {...form.getInputProps('message')}
          disabled={loading}
          minRows={4}
          mb="md"
        />
        <Group justify="center">
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
            color="blue"
            fullWidth
            maw={200}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </Group>
      </form>

      {/* Error Message */}
      {error && (
        <Text c="red" bg="red.1" p="sm" mt="md" ta="center" fw={500} style={{ borderRadius: '4px' }}>
          {error}
        </Text>
      )}

      {/* Contacts List */}
      <Box mt="xl">
        {loading && <Text ta="center" c="dimmed">Updating...</Text>}
        {contacts.length === 0 && !loading && (
          <Text ta="center" c="dimmed">No contacts submitted yet.</Text>
        )}
        {contacts.map((contact) => (
          <Box
            key={contact.id}
            p="md"
            mb="sm"
            bg="white"
            style={{ borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
          >
            <Text fw={500}>
              {contact.first_name} {contact.last_name}
            </Text>
            <Text c="dimmed" size="sm">Email: {contact.email}</Text>
            <Text c="dimmed" size="sm">Phone: {contact.phone}</Text>
            <Text c="dimmed" size="sm">Message: {contact.message}</Text>
            <Text c="dimmed" size="xs" mt="xs">
              Submitted: {new Date(contact.created_at).toLocaleString()}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
}