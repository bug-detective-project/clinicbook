# Solução: A rota da ficha do paciente, com abas

**O que faltava.** O `client/src/App.tsx` não tinha rota para `/patients/:id`, então todo link para uma ficha caía na rota coringa, "Page not found". As duas partes da ficha (`PatientDetails`, `PatientAppointments`) existiam; a página que carrega o paciente e escolhe entre elas, não.

## Passo a passo

1. **Declare a rota.** No `App.tsx`, ao lado da rota da lista:

   ```tsx
   <Route path="patients" element={<PatientsPage />} />
   <Route path="patients/:id/*" element={<PatientRecord />} />
   ```

   O `/*` deixa a página cuidar do que vem depois do id.
2. **Carregue o paciente do endereço.** Em `client/src/pages/PatientRecord.tsx`:

   ```tsx
   const { id } = useParams();
   const [patient, setPatient] = useState<Patient | null>(null);
   const [problem, setProblem] = useState<'missing' | 'failed' | null>(null);

   useEffect(() => {
     let current = true;
     setPatient(null);
     setProblem(null);
     getPatient(Number(id))
       .then((found) => {
         if (current) {
           setPatient(found);
         }
       })
       .catch((failure: unknown) => {
         if (current) {
           setProblem(failure instanceof ApiError && failure.status < 500 ? 'missing' : 'failed');
         }
       });
     return () => {
       current = false;
     };
   }, [id]);
   ```

   Com um problema, a página devolve o título `Patient not found` e o link `Back to the patients`; enquanto `patient` é `null`, um texto "Loading…".
3. **Mostre o título, as abas e a aba atual.**

   ```tsx
   <h2>{patient.name}</h2>

   <nav aria-label="Patient record" className={styles.tabs}>
     <NavLink to={`/patients/${patient.id}`} end>
       Details
     </NavLink>
     <NavLink to={`/patients/${patient.id}/appointments`}>Appointments</NavLink>
   </nav>

   <Routes>
     <Route index element={<PatientDetails patient={patient} />} />
     <Route path="appointments" element={<PatientAppointments patient={patient} />} />
   </Routes>
   ```

   O `NavLink` marca o link atual com `aria-current="page"`, e o `PatientRecord.module.css` estiliza `a[aria-current='page']` como a aba selecionada.

A referência também adiciona um teste de regressão, `client/src/pages/PatientRecord.test.tsx`: os dois endereços, a aba atual, a troca de aba e um paciente que não existe.

Depois rode `npm test`, abra uma ficha pela agenda, use Voltar e Avançar entre as abas e mova o card para **Em QA**.
