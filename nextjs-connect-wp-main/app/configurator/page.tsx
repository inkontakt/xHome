import { Container, Section } from "@/components/craft";
import { ConfiguratorForm } from "@/components/configurator/configurator-form";

export default function ConfiguratorPage() {
  return (
    <Section>
      <Container className="space-y-6">
        <ConfiguratorForm />
      </Container>
    </Section>
  );
}
