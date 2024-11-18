export default function formatErrors(errors: any[]): string {
    return errors.map((err) => {
        let error: string = ""

        // eslint-disable-next-line no-restricted-syntax, guard-for-in, no-unreachable-loop
        for (const property in err.constraints) {
            error += err.constraints[property]
        }

        if (err.children.length) {
            error += formatErrors(err.children)
        }

        return error
    })[0]
}
