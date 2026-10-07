import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Clock,
  Car,
  Phone,
  Save,
  CheckCircle2,
  RotateCcw,
  Trash2,
  Plus,
  ExternalLink
} from 'lucide-react';
import { ClinicData, DEFAULT_CLINIC_DATA, saveStoredClinicData } from '../../data/clinicStore';

interface AdminLocalizacaoTabProps {
  clinicForm: ClinicData;
  setClinicForm: React.Dispatch<React.SetStateAction<ClinicData>>;
  onSaved: () => void;
}

export const AdminLocalizacaoTab: React.FC<AdminLocalizacaoTabProps> = ({
  clinicForm,
  setClinicForm,
  onSaved
}) => {
  const [toast, setToast] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredClinicData(clinicForm);
    onSaved();
    showFeedback('Informações de localização salvas e sincronizadas com a One Page!');
  };

  // Clear/Excluir fields
  const handleClearLocation = () => {
    setClinicForm({
      ...clinicForm,
      address: '',
      landmarks: '',
      neighborhood: '',
      cityState: '',
      cep: '',
      parkingInfo: '',
      googleMapsDirectionsUrl: '',
      googleMapsEmbedUrl: '',
      wazeUrl: ''
    });
    showFeedback('Campos de localização limpos. Clique em Salvar para efetivar.');
  };

  // Restore Default
  const handleRestoreDefault = () => {
    setClinicForm({
      ...clinicForm,
      address: DEFAULT_CLINIC_DATA.address,
      landmarks: DEFAULT_CLINIC_DATA.landmarks,
      neighborhood: DEFAULT_CLINIC_DATA.neighborhood,
      cityState: DEFAULT_CLINIC_DATA.cityState,
      cep: DEFAULT_CLINIC_DATA.cep,
      parkingInfo: DEFAULT_CLINIC_DATA.parkingInfo,
      googleMapsDirectionsUrl: DEFAULT_CLINIC_DATA.googleMapsDirectionsUrl,
      googleMapsEmbedUrl: DEFAULT_CLINIC_DATA.googleMapsEmbedUrl,
      wazeUrl: DEFAULT_CLINIC_DATA.wazeUrl,
      hours: DEFAULT_CLINIC_DATA.hours
    });
    showFeedback('Localização padrão restaurada! Clique em Salvar para confirmar.');
  };

  // Hours management
  const handleAddHourRow = () => {
    const newRow = { days: 'Novo Período', time: '08:00 às 18:00' };
    setClinicForm({
      ...clinicForm,
      hours: [...(clinicForm.hours || []), newRow]
    });
  };

  const handleUpdateHour = (index: number, field: 'days' | 'time', value: string) => {
    const updated = [...(clinicForm.hours || [])];
    if (updated[index]) {
      updated[index] = { ...updated[index], [field]: value };
      setClinicForm({ ...clinicForm, hours: updated });
    }
  };

  const handleDeleteHour = (index: number) => {
    const updated = (clinicForm.hours || []).filter((_, i) => i !== index);
    setClinicForm({ ...clinicForm, hours: updated });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Info */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#D85072] bg-[#FFEBF0] px-3 py-1 rounded-full border border-[#FCD6E0]">
              Gestão da Aba Localização
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#26161B] mt-2">
              Endereço do Stúdio / Clínica / Espaço de Atendimento
            </h2>
            <p className="text-sm text-[#5B444C] mt-1 max-w-3xl">
              Poste, insira, troque ou exclua o endereço físico, referências de chegada, mapas interativos, rotas de GPS e horários de funcionamento.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleClearLocation}
              className="px-3.5 py-2 rounded-xl bg-[#FFF5F5] border border-[#FCD6E0] text-[#9C2744] hover:bg-[#FFEBF0] text-xs font-semibold transition-colors flex items-center gap-1.5"
              title="Limpar campos de endereço"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Endereço</span>
            </button>

            <button
              type="button"
              onClick={handleRestoreDefault}
              className="px-3.5 py-2 rounded-xl bg-[#FFFDFB] border border-[#FCD6E0] text-[#8C3B50] hover:bg-[#FFEBF0] text-xs font-semibold transition-colors flex items-center gap-1.5"
              title="Restaurar endereço original"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Padrão</span>
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div className="p-4 rounded-2xl bg-[#EBF7EE] border border-[#B6E3C3] text-xs sm:text-sm font-semibold text-[#1D7A46] flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Endereço & Pontos de Referência (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-sm space-y-5">
            <h3 className="font-serif text-xl font-bold text-[#26161B] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#D85072]" />
              <span>Dados do Endereço Físico</span>
            </h3>

            {/* Logradouro e Número */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26161B] mb-1.5">
                Logradouro e Número (Avenida / Rua)
              </label>
              <input
                type="text"
                value={clinicForm.address}
                onChange={(e) => setClinicForm({ ...clinicForm, address: e.target.value })}
                placeholder="Ex: Av. Noel Nutels, 1762"
                className="w-full px-4 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] font-medium focus:outline-none focus:ring-2 focus:ring-[#D85072]"
              />
            </div>

            {/* Ponto de Referência / Complemento */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26161B] mb-1.5">
                Ponto de Referência / Complemento do Espaço
              </label>
              <input
                type="text"
                value={clinicForm.landmarks}
                onChange={(e) => setClinicForm({ ...clinicForm, landmarks: e.target.value })}
                placeholder="Ex: Altos da Academia NEW FIT"
                className="w-full px-4 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] font-semibold text-[#D85072] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
              />
              <p className="text-[11px] text-[#8C3B50] mt-1">
                Aparece destacado na One Page para facilitar a chegada das alunas.
              </p>
            </div>

            {/* Bairro, Cidade/UF, CEP */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#26161B] mb-1.5">
                  Bairro
                </label>
                <input
                  type="text"
                  value={clinicForm.neighborhood}
                  onChange={(e) => setClinicForm({ ...clinicForm, neighborhood: e.target.value })}
                  placeholder="Ex: Cidade Nova"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#26161B] mb-1.5">
                  Cidade / UF
                </label>
                <input
                  type="text"
                  value={clinicForm.cityState}
                  onChange={(e) => setClinicForm({ ...clinicForm, cityState: e.target.value })}
                  placeholder="Ex: Manaus - AM"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#26161B] mb-1.5">
                  CEP
                </label>
                <input
                  type="text"
                  value={clinicForm.cep}
                  onChange={(e) => setClinicForm({ ...clinicForm, cep: e.target.value })}
                  placeholder="Ex: 69090-000"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                />
              </div>
            </div>

            {/* Informações de Estacionamento & Chegada */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26161B] mb-1.5 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-[#D85072]" />
                <span>Orientações de Estacionamento & Acesso</span>
              </label>
              <textarea
                rows={2}
                value={clinicForm.parkingInfo}
                onChange={(e) => setClinicForm({ ...clinicForm, parkingInfo: e.target.value })}
                placeholder="Ex: Vagas disponíveis em frente e nas imediações da academia. Acesso seguro e iluminado."
                className="w-full px-4 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#D85072]"
              />
            </div>

            {/* Telefone de Contato */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26161B] mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#D85072]" />
                <span>Telefone / WhatsApp de Atendimento para Dúvidas de Localização</span>
              </label>
              <input
                type="text"
                value={clinicForm.phoneDisplay}
                onChange={(e) => setClinicForm({ ...clinicForm, phoneDisplay: e.target.value })}
                placeholder="Ex: (92) 99187-5732"
                className="w-full px-4 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
              />
            </div>
          </div>

          {/* RIGHT: Links de GPS & Google Maps Embed (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Mapa e Rotas */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-sm space-y-4">
              <h3 className="font-serif text-xl font-bold text-[#26161B] flex items-center gap-2">
                <Navigation className="w-5 h-5 text-[#D85072]" />
                <span>Rotas e Mapa Interativo</span>
              </h3>

              {/* Link do Google Maps */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#26161B] mb-1.5">
                  Link Direto "Como Chegar" (Google Maps)
                </label>
                <input
                  type="url"
                  value={clinicForm.googleMapsDirectionsUrl || ''}
                  onChange={(e) => setClinicForm({ ...clinicForm, googleMapsDirectionsUrl: e.target.value })}
                  placeholder="https://maps.google.com/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#FCD6E0] text-xs text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                />
              </div>

              {/* Link do Waze */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#26161B] mb-1.5">
                  Link de Rota no Waze
                </label>
                <input
                  type="url"
                  value={clinicForm.wazeUrl || ''}
                  onChange={(e) => setClinicForm({ ...clinicForm, wazeUrl: e.target.value })}
                  placeholder="https://waze.com/ul?..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#FCD6E0] text-xs text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                />
              </div>

              {/* URL do Iframe do Mapa */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#26161B] mb-1.5">
                  URL de Incorporação do Google Maps (Embed)
                </label>
                <textarea
                  rows={2}
                  value={clinicForm.googleMapsEmbedUrl || ''}
                  onChange={(e) => setClinicForm({ ...clinicForm, googleMapsEmbedUrl: e.target.value })}
                  placeholder="https://maps.google.com/maps?q=...&output=embed"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#FCD6E0] text-xs text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                />
                <p className="text-[11px] text-[#8C3B50] mt-1">
                  O mapa abaixo renderiza uma prévia em tempo real de acordo com este link.
                </p>
              </div>

              {/* Preview do Mapa */}
              <div className="rounded-2xl overflow-hidden border border-[#FCD6E0] aspect-[16/9] bg-[#FFF5F5]">
                <iframe
                  title="Prévia do Mapa da Clínica"
                  src={
                    clinicForm.googleMapsEmbedUrl ||
                    `https://maps.google.com/maps?q=${encodeURIComponent(
                      `${clinicForm.address}, ${clinicForm.neighborhood} ${clinicForm.cityState}`
                    )}&t=&z=16&ie=UTF8&iwloc=&output=embed`
                  }
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                />
              </div>
            </div>

            {/* Horários de Atendimento */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-[#26161B] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#D85072]" />
                  <span>Horários de Atendimento</span>
                </h3>

                <button
                  type="button"
                  onClick={handleAddHourRow}
                  className="px-3 py-1.5 rounded-xl bg-[#FFEBF0] text-[#9C2744] text-xs font-semibold hover:bg-[#FCD6E0] transition-colors border border-[#FCD6E0] flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {(clinicForm.hours || []).map((h, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FFFDFB] border border-[#FCD6E0]">
                    <input
                      type="text"
                      value={h.days}
                      onChange={(e) => handleUpdateHour(idx, 'days', e.target.value)}
                      placeholder="Ex: Segunda a Sexta"
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-[#FCD6E0] text-xs font-semibold text-[#26161B] focus:outline-none focus:ring-1 focus:ring-[#D85072]"
                    />
                    <input
                      type="text"
                      value={h.time}
                      onChange={(e) => handleUpdateHour(idx, 'time', e.target.value)}
                      placeholder="Ex: 07:00 às 19:00"
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-[#FCD6E0] text-xs text-[#5B444C] focus:outline-none focus:ring-1 focus:ring-[#D85072]"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteHour(idx)}
                      className="p-1.5 rounded-lg text-[#A8928B] hover:text-[#C5221F] hover:bg-[#FDEDF0]"
                      title="Excluir este horário"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Global Save Button */}
        <div className="pt-4 border-t border-[#FCD6E0] flex justify-end">
          <button
            type="submit"
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#D85072] to-[#BC3859] text-white font-semibold text-sm hover:from-[#BC3859] hover:to-[#9C2744] transition-all shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações da Localização</span>
          </button>
        </div>
      </form>
    </div>
  );
};
