# Solution: The route of the patient record, with tabs

**What was missing.** `client/src/App.tsx` had no route for `/patients/:id`, so every link to a record fell into the catch-all route, "Page not found". The two parts of the record (`PatientDetails`, `PatientAppointments`) existed; the page that loads the patient and chooses between them did not.

## Step by step

1. **Declare the route.** In `App.tsx`, next to the route of the list:

   ```tsx
   <Route path="patients" element={<PatientsPage />} />
   <Route path="patients/:id/*" element={<PatientRecord />} />
   ```

   The `/*` lets the page handle what comes after the id.
2. **Load the patient of the address.** In `client/src/pages/PatientRecord.tsx`:

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

   With a problem, the page returns the heading `Patient not found` and the link `Back to the patients`; while `patient` is `null`, a "Loading…" text.
3. **Show the title, the tabs and the current tab.**

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

   `NavLink` marks the current link with `aria-current="page"`, and `PatientRecord.module.css` styles `a[aria-current='page']` as the selected tab.

The reference also adds a regression test, `client/src/pages/PatientRecord.test.tsx`: both addresses, the current tab, the change of tab, and a patient that does not exist.

Then run `npm test`, open a record from the agenda, use Back and Forward between the tabs, and move the card to **In QA**.
