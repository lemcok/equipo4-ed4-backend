import { FastifyReply, FastifyRequest } from "fastify"
import { CreateComments, IdComens, SearchComment, ReviewComment } from "./comments.schemas"
import { getCommentBy, createComment, getDetailComment, editComment } from "./comments.service"
import { calculateAvg } from "../places/places.service"

export async function registerComment(
    request: FastifyRequest<{
        Body: CreateComments
    }>,
    reply: FastifyReply
) {
    const comment = request.body
    const rta = { status: false, response: {} }
    const rps = { code: 500, msn: 'Error', rta: {} }
    try {
        const data = await getCommentBy(comment)
        
        rps.code = 200
        let idplace = 0
        if (data.length) {

            const raiting_comment = comment.raiting_comment

            const send = {
                id: data[0].id,
                raiting_comment,
                ...comment
            }
            const upd = await editComment(data[0].id, send)
            idplace = upd.id_place
            rps.msn = (upd) ? "Edito Ok" : "Error"
            rps.rta = upd
        }
        else {
            const send = {
                ...comment
            }
            const save = await createComment(send)
            idplace = save.id_place
            rps.msn = (save) ? "Guardo Ok" : "Error"
            rps.rta = save
        }
        rta.response = rps
        const avg = idplace ? await calculateAvg(idplace) : null
        return reply.code(201).send(rta)
    } catch (error) {
        rta.response = rps
        return reply.code(500).send(rta)
    }
}

export async function getDetailPlace(
    request: FastifyRequest<{
        Params: SearchComment;
    }>,
    reply: FastifyReply) {
    const rta = { status: false, response: {} }
    const rps = { code: 500, msn: 'Error', rta: {} }

    rps.code = 200
    try {
        rta.status = true

        const data = await getCommentBy(request.params)
        rps.msn = (data) ? "Busqueda Ok" : "Error"
        rps.rta = (data.length) ? data[0] : {}
        rta.response = rps
        return reply.code(201).send(rta)
    } catch (error) {
        rta.response = rps
        return reply.code(500).send(rta)
    }
}

export async function setEditPlace(
    request: FastifyRequest<{
        Body: ReviewComment;
        Params: IdComens;
    }>,
    reply: FastifyReply
) {
    const rta = { status: false, response: {} }
    const rps = { code: 500, msn: 'Error', rta: {} }
    const idparam = request.params.id
    const updatep = request.body
    try {
        rps.code = 200
        rta.status = true

        const data = await editComment(idparam, updatep)

        const avg = data.id_place ? await calculateAvg(data.id_place) : null

        rps.msn = (data) ? "Busqueda Ok" : "Error"
        rps.rta = data
        rta.response = rps
        return reply.code(201).send(rta)

    } catch (error) {
        rta.response = rps
        return reply.code(500).send(rta)
    }
}